import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Db, WithId, Document } from 'mongodb';
import { MONGODB_DATABASE } from '../../database/database.module';
import { AdvertsService } from '../../adverts/adverts/adverts.service';

@Injectable()
export class ArchiveService {
  constructor(
    @Inject(MONGODB_DATABASE) private db: Db,
    private advertsService: AdvertsService,
  ) {}

  async getArchiveByUserId(userId: string): Promise<any[]> {
    const docs = this.db.collection('archive').find({ owner: userId });

    const arr: WithId<Document>[] = [];
    for await (const doc of docs) {
      arr.push(doc);
    }

    return arr;
  }

  async moveToArchive(adId: number): Promise<void> {
    try {
      // Get advert directly from AdvertsService
      const doc = await this.advertsService.getOneById(adId);

      // Delete from adverts collection
      await this.advertsService.deleteOneById(adId);

      // Save to archive
      delete doc._id;
      await this.db.collection('archive').insertOne(doc);
    } catch (error: any) {
      console.error('Error moving to archive:', error);
      throw new HttpException('Cannot move to archive', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteOne(adId: number): Promise<void> {
    await this.db.collection('archive').deleteOne({ id: adId });
  }
}
