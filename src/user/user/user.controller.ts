import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import { FavoritesService } from '../favorites/favorites.service';

@Controller('user')
export class UserController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get('/favourites/all')
  async getFavorites(@Query('user') userId: string) {
    if (!userId || !userId.length) {
      throw new HttpException('Missing user ID in query parameters', HttpStatus.BAD_REQUEST);
    }

    try {
      return await this.favoritesService.getAllFavorites(userId);
    } catch (error) {
      console.error('Error fetching favorite ads:', error);
      throw new HttpException('Cannot load favorite list', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
