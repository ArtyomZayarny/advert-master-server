import { Controller, Get, Inject } from '@nestjs/common';
import { MONGODB_CLIENT } from '../database/database.module';
import { MongoClient } from 'mongodb';
import { HealthCheckResponse } from '@app/common';

@Controller('health')
export class HealthController {
  constructor(@Inject(MONGODB_CLIENT) private mongoClient: MongoClient) {}

  @Get()
  async check(): Promise<HealthCheckResponse> {
    const uptime = process.uptime();

    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      await this.mongoClient.db().admin().ping();
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'disconnected';
    }

    const status = dbStatus === 'connected' ? 'ok' : 'error';

    return {
      status,
      service: 'adverts-service',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      database: {
        status: dbStatus,
      },
    };
  }
}
