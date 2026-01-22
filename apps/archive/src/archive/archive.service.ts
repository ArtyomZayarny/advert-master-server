import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Db, WithId, Document } from 'mongodb';
import { MONGODB_DATABASE } from '../database/database.module';
import axios from 'axios';

@Injectable()
export class ArchiveService {
  constructor(@Inject(MONGODB_DATABASE) private db: Db) {}

  async getArchiveByUserId(userId: string): Promise<any[]> {
    const docs = this.db.collection('archive').find({ owner: userId });

    const arr: WithId<Document>[] = [];
    for await (const doc of docs) {
      arr.push(doc);
    }

    return arr;
  }

  async moveToArchive(adId: number): Promise<void> {
    const advertsServiceUrl = process.env.ADVERTS_SERVICE_URL || 'http://localhost:3002';

    try {
      // Get advert from adverts-service
      const response = await axios.get(`${advertsServiceUrl}/adverts/${adId}`, { timeout: 5000 });
      const doc = response.data;

      // Delete from adverts collection (via adverts-service)
      await axios.delete(`${advertsServiceUrl}/adverts/delete/ad`, {
        data: { id: adId },
        timeout: 5000,
      });

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
