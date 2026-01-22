import {
  Controller,
  Get,
  Post,
  Put,
  UseGuards,
  Headers,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { AdvertsService } from './adverts.service';
import { FileService } from '../file/file.service';
import { AuthGuard } from './auth.guard';
import { JwtService } from '../../common/jwt.service';

@Controller(':cat')
export class AdvertsController {
  constructor(
    private readonly advertsService: AdvertsService,
    private readonly fileService: FileService,
    private readonly jwtService: JwtService,
  ) {}

  @Get('/adverts')
  async getAdverts(
    @Param('cat') category: string,
    @Query('limit') limit: string,
    @Query('offset') offset: string,
    @Query('price') priceSort: string,
    @Query('sort') sort: string,
    @Query('city') city: string,
    @Query('price_min') priceMin: string,
    @Query('price_max') priceMax: string,
  ) {
    try {
      // Support both 'price' (legacy) and 'sort' parameters
      const sortParam = sort || priceSort;
      // Map frontend sort values to backend format
      let mappedSort: string | undefined;
      if (sortParam === 'price_asc' || sortParam === 'cheap') {
        mappedSort = 'cheap';
      } else if (sortParam === 'price_desc' || sortParam === 'expensive') {
        mappedSort = 'expensive';
      }

      const ads = await this.advertsService.getAdvertsByCategory(
        category,
        Number(limit) || 8,
        Number(offset) || 0,
        mappedSort,
        city,
        priceMin ? Number(priceMin) : undefined,
        priceMax ? Number(priceMax) : undefined,
      );

      return {
        results: ads.docs,
        overall_total: ads.length,
      };
    } catch (e) {
      return { results: [], overall_total: 0 };
    }
  }

  @UseGuards(AuthGuard)
  @Post('/create')
  @UseInterceptors(FileInterceptor('upload'))
  async create(@Headers('Authorization') bearer: string, @Body() body: any, @Param('cat') param: string, @UploadedFile() file?: import('@app/common').MulterFile) {
    const userId = this.jwtService.verifyToken(bearer.split(' ')[1]);
    if (!file) {
      throw new HttpException('Photo is required', HttpStatus.BAD_REQUEST);
    }

    let post: Record<string, any> = { ...body };
    delete post.upload;

    // Process geocode
    if (post.geocode) {
      const geo = post.geocode.split(' ');
      post.geo_indexed = [parseFloat(geo[1]), parseFloat(geo[0])];
    }

    post.db_category = param;
    post.created_at = new Date().toISOString();
    post.updated_at = null;
    post.lifts = Number(post.lifts) || 0;
    post.top = Number(post.top) || 0;
    post.vip = Number(post.vip) || 0;

    // Upload main photo
    const uploadUrl = await this.fileService.uploadAdvertPhoto(file);
    post.upload = uploadUrl;
    post.full_upload = [];

    const created = await this.advertsService.createNewAdv(post, userId);
    return created;
  }

  @Post('/delete/ad')
  async delete(@Body() body: { id: number }) {
    try {
      await this.advertsService.deleteOneById(body.id);
    } catch (e) {
      console.log(e);
    }
    return 'advert delete';
  }

  @Post('/full_uploads')
  @UseInterceptors(FileInterceptor('uploads'))
  async fullUploads(@Body() body: any, @UploadedFile() file?: import('@app/common').MulterFile) {
    if (!file) {
      throw new HttpException('no files was provided', HttpStatus.BAD_REQUEST);
    }
    let advert: any = {};
    try {
      advert = await this.advertsService.getOneById(Number(body.full_upload));
    } catch (e) {
      throw new HttpException('Advert not found', HttpStatus.BAD_REQUEST);
    }

    const uploadUrl = await this.fileService.uploadAdvertPhoto(file);

    advert.full_upload.push({
      id: 0,
      uploads: uploadUrl,
      sort_order: 1000,
      full_upload: 1,
    });

    try {
      await this.advertsService.updateFullUploads(Number(body.full_upload), advert.full_upload);
    } catch (e) {
      throw new HttpException('Cannot update photos', HttpStatus.BAD_REQUEST);
    }

    return {
      id: 0,
      uploads: '',
      sort_order: 0,
      realty_full_upload: 0,
    };
  }

  @Post('/full_uploads/edit')
  @UseInterceptors(FileInterceptor('uploads'))
  async fullUploadsEdit(@Body() body: any, @UploadedFile() file?: import('@app/common').MulterFile) {

    if (!file) {
      throw new HttpException('No file provided', HttpStatus.BAD_REQUEST);
    }

    let advert: any = {};
    try {
      advert = await this.advertsService.getOneById(Number(body.full_upload));
    } catch (e) {
      throw new HttpException('Cannot get advert', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const filename = file.originalname.slice(0, file.originalname.length - (file.mimetype.split('/')[1].length + 1));

    let exist = false;
    advert.full_upload.map((data: any) => {
      if (data.uploads.includes(filename)) {
        exist = true;
      }
    });

    if (exist) {
      throw new HttpException('file already uploaded', HttpStatus.NOT_MODIFIED);
    }

    const uploadUrl = await this.fileService.uploadAdvertPhoto(file);

    advert.full_upload.push({
      id: 0,
      uploads: uploadUrl,
      sort_order: 1000,
      full_upload: 1,
    });

    try {
      await this.advertsService.updateFullUploads(advert.id, advert.full_upload);
    } catch (e) {
      throw new HttpException('Cannot save updated photos', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return {
      id: 0,
      uploads: '',
      sort_order: 0,
      realty_full_upload: 0,
    };
  }

  @Get('/:id')
  async getById(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('id is not provided', HttpStatus.BAD_REQUEST);
    }

    let adv: any = {};
    try {
      adv = await this.advertsService.getOneById(Number(id));
    } catch (e) {
      throw new HttpException('Advert not found', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    adv.user = adv.owner;
    return adv;
  }

  @Put('/:id')
  @UseInterceptors(FileInterceptor('upload'))
  async edit(@Param('id') id: string, @Body() body: any, @UploadedFile() file?: import('@app/common').MulterFile) {
    let adv: any = {};
    try {
      adv = await this.advertsService.getOneById(Number(id));
    } catch (e) {
      throw new HttpException('Error while getting data from db', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    Object.keys(adv).map((key) => {
      if (!Object.keys(body).includes(key)) return;

      const data = body[key];
      if (data !== undefined && key !== 'upload' && key !== 'full_upload') {
        adv[key] = data;
      }
    });

    adv.updated_at = new Date().toISOString();

    try {
      await this.advertsService.replace(Number(id), adv);
    } catch (e) {
      throw new HttpException('Error while saving data in db', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return adv;
  }

  @Post('/favourites')
  async addToFavorite(@Body() body: { ad_id: string; user: string }) {
    // This will be handled by user-service
    // Just update views
    await this.advertsService.updateViewsOnLike(Number(body.ad_id));
    return { success: true };
  }
}

@Controller('recom')
export class RecommendationsController {
  constructor(private readonly advertsService: AdvertsService) {}

  @Post('/view')
  async viewed(@Body() body: { id: string }) {
    try {
      await this.advertsService.updateViews(Number(body.id));
      return {};
    } catch (e) {
      throw new HttpException('Cannot update views', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/post_recommend')
  async recommendInPost(@Query('category') category: string, @Query('forId') forId: string) {
    let adv = [];
    try {
      adv = await this.advertsService.getRecomm(category, Number(forId));
    } catch (e) {
      throw new HttpException('Cannot get recommendations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return adv;
  }
}

@Controller('adverts')
export class AdvertsByIdController {
  constructor(private readonly advertsService: AdvertsService) {}

  @Get('/:id')
  async getById(@Param('id') id: string) {
    if (!id) {
      throw new HttpException('id is not provided', HttpStatus.BAD_REQUEST);
    }

    let adv: any = {};
    try {
      adv = await this.advertsService.getOneById(Number(id));
    } catch (e) {
      throw new HttpException('Advert not found', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    adv.user = adv.owner;
    return adv;
  }
}

@Controller()
export class MainController {
  constructor(private readonly advertsService: AdvertsService) {}

  @Get('/new')
  async newAdvs(@Query('limit') limit: string, @Query('offset') offset: string) {
    const categories = {
      avto: [],
      children: [],
      electronics: [],
      fashion: [],
      house_garden: [],
      realty: [],
      services: [],
      work: [],
      free: [],
    };

    const posts = await this.advertsService.getLastAds(
      Number.isNaN(Number(limit)) ? 8 : Number(limit),
      Number(offset) || 0,
    );

    posts.map((entry: any) => {
      if (categories[entry.db_category]) {
        categories[entry.db_category].push(entry);
      }
    });

    return categories;
  }

  @Get('/count_ads')
  async count() {
    try {
      const l = await this.advertsService.length();
      return 20000 + l * 3;
    } catch (e) {
      throw e;
    }
  }

  @Get('/my_ads')
  async myads(@Query('user_id') id: string) {
    let ads: any[] = [];

    const cats = {
      avto: [],
      children: [],
      electronics: [],
      fashion: [],
      house_garden: [],
      realty: [],
      services: [],
      work: [],
      free: [],
    };

    try {
      ads = await this.advertsService.getAdvsByUserId(id);
    } catch (e) {
      throw new HttpException('Cannot get user ads', HttpStatus.BAD_REQUEST);
    }

    ads.map((entry: any) => {
      if (cats[entry.db_category]) {
        cats[entry.db_category].push(entry);
      }
    });

    return cats;
  }

  @Get('/category/cities')
  async getUsedCities() {
    const cats = {
      avto: [],
      children: [],
      electronics: [],
      fashion: [],
      house_garden: [],
      realty: [],
      services: [],
      work: [],
      free: [],
    };

    let cities;
    try {
      cities = await this.advertsService.getCities();
    } catch (e) {
      throw new HttpException('Cannot load cities', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    cities.map((entry: any) => {
      if (!cats[entry.db_category].map((e: any) => e.address).includes(entry.city)) {
        cats[entry.db_category].push({
          address: entry.city,
          geo: entry.geo_indexed,
        });
      }
    });

    return cats;
  }
}
