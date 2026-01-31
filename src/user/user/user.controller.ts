import { Controller, Get, Post, Delete, Query, Body, Req, HttpException, HttpStatus } from '@nestjs/common';
import { Request } from 'express';
import { FavoritesService } from '../favorites/favorites.service';
import { JwtService } from '../jwt/jwt.service';

@Controller('user')
export class UserController {
  constructor(
    private readonly favoritesService: FavoritesService,
    private readonly jwtService: JwtService,
  ) {}

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

  @Post('/favourites')
  async addFavorite(@Body() body: { advertId: number }, @Req() req: Request) {
    const token = (req as any).cookies?.access_token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const userId = this.jwtService.verifyToken(token);
    if (!userId) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this.favoritesService.addFavorite(userId, body.advertId);
      return { success: true };
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw new HttpException('Cannot add to favorites', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('/favourites')
  async removeFavorite(@Body() body: { advertId: number }, @Req() req: Request) {
    const token = (req as any).cookies?.access_token || req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new HttpException('Unauthorized', HttpStatus.UNAUTHORIZED);
    }

    const userId = this.jwtService.verifyToken(token);
    if (!userId) {
      throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
    }

    try {
      await this.favoritesService.removeFavorite(userId, body.advertId);
      return { success: true };
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw new HttpException('Cannot remove from favorites', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
