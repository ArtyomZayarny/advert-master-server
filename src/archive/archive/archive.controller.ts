import { Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Query } from '@nestjs/common';
import { ArchiveService } from './archive.service';

@Controller('/archive')
export class ArchiveController {
  constructor(private readonly archiveService: ArchiveService) {}

  @Get('/')
  async getAllByUser(@Query('id') userId: string) {
    if (!userId) {
      throw new HttpException('no user id was provided', HttpStatus.BAD_REQUEST);
    }

    let advs = [];
    try {
      advs = await this.archiveService.getArchiveByUserId(userId);
    } catch (e) {
      throw new HttpException('Cannot get archive', HttpStatus.INTERNAL_SERVER_ERROR);
    }

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

    advs.map((entry: any) => {
      if (categories[entry.db_category]) {
        categories[entry.db_category].push(entry);
      }
    });

    return categories;
  }

  @Post(':id')
  async moveToArchive(@Param('id') id: string) {
    const advId = Number(id);

    if (Number.isNaN(advId)) {
      throw new HttpException('incorrect id', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.archiveService.moveToArchive(advId);
    } catch (e) {
      throw new HttpException('Cannot move to archive', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return 'done';
  }

  @Delete(':id')
  async deleteOneArchived(@Param('id') id: string) {
    const advId = Number(id);

    if (Number.isNaN(advId)) {
      throw new HttpException('incorrect id', HttpStatus.BAD_REQUEST);
    }

    try {
      await this.archiveService.deleteOne(advId);
    } catch (e) {
      throw new HttpException('Cannot delete from archive', HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return 'done';
  }
}
