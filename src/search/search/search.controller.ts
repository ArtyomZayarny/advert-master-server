import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import axios from 'axios';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('/popular')
  async popular() {
    try {
      return await this.searchService.getPopular();
    } catch (e) {
      console.log(e);
      return [];
    }
  }

  @Post('/seek')
  async results(
    @Query('start') start: string,
    @Query('limit') limit: string,
    @Query('search') search: string,
    @Body() body: any,
    @Query('city') city: string,
    @Query('price') sort: string,
  ) {
    const advertsServiceUrl = process.env.ADVERTS_SERVICE_URL || 'http://localhost:3002';

    const result: any = {
      results: [],
      total: 0,
      end: 0,
      limit: limit || '8',
      metadata: [],
    };

    if (!body) return result;

    if (body.metadata) {
      // Pagination mode - get ads by IDs from metadata
      if (body.page == undefined) {
        throw new HttpException('Page is required', HttpStatus.BAD_REQUEST);
      }
      if (Number(body.page) > body.metadata.length - 1) {
        throw new HttpException('Page out of range', HttpStatus.BAD_REQUEST);
      }

      const results = [];
      for (const id of body.metadata[Number(body.page)]) {
        try {
          const response = await axios.get(`${advertsServiceUrl}/adverts/${id}`, { timeout: 5000 });
          results.push(response.data);
        } catch (e) {
          console.log('Error fetching ad:', e);
        }
      }

      return results;
    } else {
      // Initial search
      if (!search?.length) {
        return [];
      }

      // Call adverts-service to search
      // For now, return empty - would need proper search endpoint in adverts-service
      const searchKeys = search.split(' ');

      // Add to search history
      if (searchKeys.length > 0) {
        await this.searchService.addInSearch(search);
      }

      return result;
    }
  }

  @Get('/preseek')
  async search(@Query('search') search: string) {
    if (!search) {
      return [];
    }

    try {
      const phrases = await this.searchService.searchPopular(search.split(' '));
      return phrases;
    } catch (e) {
      return [];
    }
  }
}
