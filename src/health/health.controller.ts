import { Controller, Get, Inject } from '@nestjs/common';
import { DATABASE_POOL, POSTGRES_POOL, REDIS_CLIENT, MONGODB_CLIENT } from '../database/database.module';
import { Pool } from 'pg';
import { RedisClientType } from 'redis';
import { MongoClient } from 'mongodb';

@Controller('health')
export class HealthController {
  constructor(
    @Inject(DATABASE_POOL) private authDb: Pool,
    @Inject(POSTGRES_POOL) private userDb: Pool,
    @Inject(REDIS_CLIENT) private redis: RedisClientType,
    @Inject(MONGODB_CLIENT) private mongo: MongoClient,
  ) {}

  @Get()
  async check() {
    const checks = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      databases: {
        postgresql_auth: 'unknown',
        postgresql_user: 'unknown',
        redis: 'unknown',
        mongodb: 'unknown',
      },
    };

    // Check PostgreSQL (auth)
    try {
      await this.authDb.query('SELECT 1');
      checks.databases.postgresql_auth = 'connected';
    } catch (error) {
      checks.databases.postgresql_auth = 'disconnected';
    }

    // Check PostgreSQL (user)
    try {
      await this.userDb.query('SELECT 1');
      checks.databases.postgresql_user = 'connected';
    } catch (error) {
      checks.databases.postgresql_user = 'disconnected';
    }

    // Check Redis
    try {
      await this.redis.ping();
      checks.databases.redis = 'connected';
    } catch (error) {
      checks.databases.redis = 'disconnected';
    }

    // Check MongoDB
    try {
      await this.mongo.db().admin().ping();
      checks.databases.mongodb = 'connected';
    } catch (error) {
      checks.databases.mongodb = 'disconnected';
    }

    return checks;
  }
}
