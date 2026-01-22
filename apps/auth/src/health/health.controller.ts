import { Controller, Get, Inject } from '@nestjs/common';
import { DATABASE_POOL, REDIS_CLIENT } from '../database/database.module';
import { Pool } from 'pg';
import { RedisClientType } from 'redis';
import { HealthCheckResponse } from '@app/common';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_POOL) private pool: Pool,
    @Inject(REDIS_CLIENT) private redis: RedisClientType,
  ) {}

  @Get()
  async check(): Promise<HealthCheckResponse> {
    const startTime = Date.now();
    const uptime = process.uptime();

    let dbStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      await this.pool.query('SELECT NOW()');
      dbStatus = 'connected';
    } catch (error) {
      dbStatus = 'disconnected';
    }

    let redisStatus: 'connected' | 'disconnected' = 'disconnected';
    try {
      await this.redis.ping();
      redisStatus = 'connected';
    } catch (error) {
      redisStatus = 'disconnected';
    }

    const status = dbStatus === 'connected' && redisStatus === 'connected' ? 'ok' : 'error';

    return {
      status,
      service: 'auth-service',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(uptime),
      database: {
        status: dbStatus === 'connected' && redisStatus === 'connected' ? 'connected' : 'disconnected',
      },
    };
  }
}
