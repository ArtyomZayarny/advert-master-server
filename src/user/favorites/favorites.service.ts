import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Db } from 'mongodb';
import { MONGODB_DATABASE } from '../../database/database.module';
import { AdvertsService } from '../../adverts/adverts/adverts.service';

@Injectable()
export class FavoritesService {
  constructor(
    @Inject(MONGODB_DATABASE) private db: Db,
    private advertsService: AdvertsService,
  ) {}

  async getFavoritesIds(userId: string): Promise<number[]> {
    try {
      const doc = await this.db.collection('fav').findOne({ user: userId });
      return doc?.ids || [];
    } catch {
      return [];
    }
  }

  async addFavorite(userId: string, adId: number): Promise<void> {
    await this.db.collection('fav').updateOne(
      { user: userId },
      {
        $setOnInsert: { user: userId, ids: [] },
        // @ts-ignore - MongoDB update operators
        $push: { ids: adId },
      },
      { upsert: true },
    );
  }

  async removeFavorite(userId: string, adId: number): Promise<void> {
    await this.db.collection('fav').updateOne(
      { user: userId },
      {
        // @ts-ignore - MongoDB update operators
        $pull: { ids: adId },
      },
    );
  }

  async getAllFavorites(userId: string): Promise<any> {
    const userFav = await this.getFavoritesIds(userId);

    if (!userFav.length) {
      return {
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
    }

    const catModel = {
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

    // Get adverts directly from AdvertsService
    for (const adId of userFav) {
      try {
        const ad = await this.advertsService.getOneById(adId);
        if (ad && ad.db_category && catModel[ad.db_category]) {
          catModel[ad.db_category].push({
            id: userFav.indexOf(adId),
            full_id: adId,
            user: userId,
          });
        }
      } catch (error) {
        console.error(`Error fetching ad ${adId}:`, error);
      }
    }

    return catModel;
  }
}
