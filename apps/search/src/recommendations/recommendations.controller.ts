import { Body, Controller, Get, HttpException, HttpStatus, Post, Query } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import axios from 'axios';

@Controller('recom')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Post('/view')
  async viewed(@Body() body: { id: string }) {
    const advertsServiceUrl = process.env.ADVERTS_SERVICE_URL || 'http://localhost:3002';

    try {
      await axios.post(
        `${advertsServiceUrl}/recom/view`,
        { id: body.id },
        {
          timeout: 5000,
        },
      );
      return {};
    } catch (e) {
      throw new HttpException('Cannot update views', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('/post_recommend')
  async recommendInPost(@Query('category') category: string, @Query('forId') forId: string) {
    const advertsServiceUrl = process.env.ADVERTS_SERVICE_URL || 'http://localhost:3002';

    try {
      const response = await axios.get(`${advertsServiceUrl}/recom/post_recommend`, {
        params: { category, forId },
        timeout: 5000,
      });
      return response.data;
    } catch (e) {
      throw new HttpException('Cannot get recommendations', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
