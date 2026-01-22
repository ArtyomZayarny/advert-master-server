import { Controller, Get, Inject } from '@nestjs/common';
import { POSTGRES_POOL, MONGODB_CLIENT } from '../database/database.module';
import { Pool } from 'pg';
import { MongoClient } from 'mongodb';
import { HealthCheckResponse } from '@app/common';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(POSTGRES_POOL) private pool: Pool,
    @Inject(MONGODB_CLIENT) private mongoClient: MongoClient,
  ) {}

  @Get()
  async check(): Promise<HealthCheckResponse> {
    const uptime = process.uptime();

    let postgresStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      await this.pool.query('SELECT NOW()');
      postgresStatus = 'connected';
    } catch (error) {
      postgresStatus = 'disconnected';
    }

    let mongoStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      await this.mongoClient.db().admin().ping();
      mongoStatus = 'connected';
    } catch (error) {
      mongoStatus = 'disconnected';
    }

    const status = postgresStatus === 'connected' && mongoStatus === 'connected' ? 'ok' : 'error';

    return {
      status,
      service: 'user-service',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      database: {
        status: postgresStatus === 'connected' && mongoStatus === 'connected' ? 'connected' : 'disconnected',
      },
    };
  }
}
