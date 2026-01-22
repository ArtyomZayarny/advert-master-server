import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Db, Filter, WithId, Document } from 'mongodb';
import { MONGODB_DATABASE } from '../database/database.module';
import { FileService } from '../file/file.service';
import { Advert, AdvertCreateDTO } from '@app/common';

@Injectable()
export class AdvertsService {
  constructor(
    @Inject(MONGODB_DATABASE) private db: Db,
    private fileService: FileService,
  ) {}

  async getOneById(id: number): Promise<any> {
    const doc = await this.db.collection('advs').findOne({ id });
    if (!doc) {
      throw new HttpException('Advert not found', HttpStatus.NOT_FOUND);
    }
    return doc;
  }

  async createNewAdv(adv: Record<string, any>, userId: string): Promise<any> {
    const lastId = await this.db
      .collection('advs')
      .find({}, { projection: { id: 1 } })
      .sort({ id: -1 })
      .limit(1)
      .toArray();

    adv.id = lastId.length > 0 ? lastId[0].id + 1 : 1;
    adv.owner = userId;
    adv.created_at = new Date().toISOString();
    adv.updated_at = null;
    adv.views = 0;
    adv.top = adv.top || 0;
    adv.vip = adv.vip || 0;
    adv.lifts = adv.lifts || 0;

    try {
      await this.db.collection('advs').insertOne(adv);
      return adv;
    } catch (e) {
      throw new HttpException('Cannot create advertisement', HttpStatus.BAD_REQUEST);
    }
  }

  async getAdvertsByCategory(
    category: string,
    limit: number = 8,
    offset: number = 0,
    sort?: string,
    city?: string,
  ): Promise<{ docs: any[]; length: number }> {
    const find: Filter<Document> = {};
    if (category) {
      find.db_category = category;
    }
    if (city) {
      find.city = city;
    }

    const length = await this.db.collection('advs').countDocuments(find);

    let cursor = this.db
      .collection('advs')
      .find(find)
      .sort({ vip: -1, top: -1, lifts: -1 })
      .skip(offset)
      .limit(limit);

    const arr: WithId<Document>[] = [];
    for await (const doc of cursor) {
      arr.push(doc);
    }

    // Sort by price if needed
    if (sort === 'cheap' || sort === 'expensive') {
      arr.sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return sort === 'cheap' ? priceA - priceB : priceB - priceA;
      });
    }

    return { length, docs: arr };
  }

  async getLastAds(limit: number = 8, offset: number = 0): Promise<any[]> {
    const docs = this.db
      .collection('advs')
      .find({})
      .sort({ $natural: -1 })
      .limit(limit)
      .skip(offset);

    const arr: any[] = [];
    for await (const doc of docs) {
      arr.push(doc);
    }
    return arr;
  }

  async getAdvsByUserId(userId: string): Promise<any[]> {
    const docs = this.db
      .collection('advs')
      .find({ owner: userId })
      .sort({ $natural: -1 });

    const arr: any[] = [];
    for await (const doc of docs) {
      arr.push(doc);
    }
    return arr;
  }

  async updateViews(id: number): Promise<void> {
    await this.db.collection('advs').updateOne({ id }, { $inc: { views: 1 } });
  }

  async updateViewsOnLike(id: number): Promise<void> {
    await this.db.collection('advs').updateOne({ id }, { $inc: { views: 2 } });
  }

  async getRecomm(category: string, currentId: number, limit: number = 30): Promise<any[]> {
    const docs = this.db
      .collection('advs')
      .find({
        db_category: category,
        id: { $ne: currentId },
      })
      .sort({ vip: -1, top: -1, views: -1 })
      .limit(limit);

    const arr: any[] = [];
    for await (const doc of docs) {
      arr.push(doc);
    }
    return arr;
  }

  async replace(id: number, doc: any): Promise<void> {
    await this.db.collection('advs').replaceOne({ id }, doc);
  }

  async deleteOneById(id: number): Promise<void> {
    await this.db.collection('advs').deleteOne({ id });
  }

  async length(): Promise<number> {
    return await this.db.collection('advs').countDocuments();
  }

  async getCities(): Promise<any[]> {
    const docs = this.db.collection('advs').find({}, { projection: { db_category: 1, geo_indexed: 1, city: 1 } });

    const arr: any[] = [];
    for await (const doc of docs) {
      arr.push(doc);
    }
    return arr;
  }

  async updateFullUploads(id: number, fullUpload: any[]): Promise<void> {
    await this.db.collection('advs').updateOne({ id }, { $set: { full_upload: fullUpload } });
  }

  async removeExpired(): Promise<void> {
    const date = new Date(Date.now() - 28 * 24 * 60 * 60 * 1000);
    const outdated = await this.db
      .collection('advs')
      .find({ created_at: { $lte: date.toISOString() } })
      .toArray();

    if (outdated.length > 0) {
      // Move to archive (will be handled by archive service)
      // For now, just delete
      const ids = outdated.map((entry) => entry.id);
      await this.db.collection('advs').deleteMany({ id: { $in: ids } });
    }
  }

  async updateVip(): Promise<void> {
    await this.db.collection('advs').updateMany({ vip: { $gt: 0 } }, { $inc: { vip: -1 } });
  }

  async updateTop(): Promise<void> {
    await this.db.collection('advs').updateMany({ top: { $gt: 0 } }, { $inc: { top: -1 } });
  }
}
