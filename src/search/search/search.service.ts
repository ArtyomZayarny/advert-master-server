import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
import { Db, Filter, Document } from 'mongodb';
import { MONGODB_DATABASE } from '../../database/database.module';

@Injectable()
export class SearchService {
  constructor(@Inject(MONGODB_DATABASE) private db: Db) {}

  async getPopular(): Promise<string[]> {
    const docs = this.db.collection('search').find({}).sort({ times: -1 }).limit(10);

    const arr: string[] = [];
    for await (const doc of docs) {
      arr.push(doc.text as string);
    }

    return arr;
  }

  async addInSearch(text: string): Promise<void> {
    const update = {
      $setOnInsert: { text },
      $inc: { times: 1 },
    };

    await this.db.collection('search').updateOne({ text }, update, { upsert: true });
  }

  async searchPopular(searchKeys: string[]): Promise<string[]> {
    const searchFilter: Filter<Document> = {
      text: { $in: searchKeys.map((key) => new RegExp(key, 'i')) },
    };

    const docs = this.db.collection('search').find(searchFilter).sort({ times: -1 }).limit(10);

    const arr: string[] = [];
    for await (const doc of docs) {
      arr.push(doc.text);
    }

    return arr;
  }

  async search(
    searchKeys: string[],
    city?: string,
    sort?: string,
    page: number = 0,
    limit: number = 8,
  ): Promise<any> {
    const advertsServiceUrl = process.env.ADVERTS_SERVICE_URL || 'http://localhost:3002';

    // Search in adverts collection via adverts-service
    const searchFilter: any = {
      $or: [
        { title: { $in: searchKeys.map((key) => new RegExp(key, 'i')) } },
        { description: { $in: searchKeys.map((key) => new RegExp(key, 'i')) } },
      ],
    };

    if (city) {
      searchFilter.city = city;
    }

    // Get all matching ad IDs from adverts-service
    // For now, we'll use MongoDB directly if we have access to adverts DB
    // Otherwise, we need to call adverts-service API

    // Since we don't have direct access, we'll need to call adverts-service
    // But for simplicity, let's assume we can search in a shared search index
    // In production, you'd want to use Elasticsearch or similar

    const result: any = {
      results: [],
      total: 0,
      end: 0,
      limit: limit,
      metadata: [],
    };

    // For now, return empty results - this would need proper search implementation
    // with Elasticsearch or direct MongoDB access to adverts collection
    return result;
  }
}
