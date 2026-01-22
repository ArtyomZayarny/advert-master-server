import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { createClient } from 'redis';

export const DATABASE_POOL = 'DATABASE_POOL';
export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  providers: [
    {
      provide: DATABASE_POOL,
      useFactory: async (configService: ConfigService) => {
        const postgresUrl = configService.get<string>('POSTGRES_URL');
        
        let pool: Pool;
        if (postgresUrl && postgresUrl.trim()) {
          // Use connection string if provided
          console.log('🔍 Using POSTGRES_URL for connection');
          pool = new Pool({
            connectionString: postgresUrl.trim(),
          });
        } else {
          // Fallback to individual variables with safe defaults
          const host = configService.get<string>('POSTGRES_HOST') || 'localhost';
          const port = parseInt(configService.get<string>('POSTGRES_PORT') || '5432', 10);
          const user = configService.get<string>('POSTGRES_USER') || 'advert';
          const password = configService.get<string>('POSTGRES_PASSWORD') || 'advert123';
          const database = configService.get<string>('POSTGRES_DB') || 'advert_auth';
          
          console.log(`🔍 Using individual POSTGRES vars: ${host}:${port}/${database}`);
          
          // Проверка на некорректные значения
          if (host === 'base' || !host || host.trim() === '') {
            console.warn('⚠️  Invalid POSTGRES_HOST detected, using localhost');
            pool = new Pool({
              host: 'localhost',
              port: 5432,
              user: user,
              password: password,
              database: database,
            });
          } else {
            pool = new Pool({
              host: host,
              port: port,
              user: user,
              password: password,
              database: database,
            });
          }
        }

        // Test connection
        try {
          await pool.query('SELECT NOW()');
          console.log('✅ PostgreSQL connected');
        } catch (error) {
          console.error('❌ PostgreSQL connection error:', error);
        }

        return pool;
      },
      inject: [ConfigService],
    },
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get('REDIS_HOST') || 'localhost';
        const redisPort = configService.get('REDIS_PORT') || '6379';
        const redisUser = configService.get('REDIS_USER');
        const redisPassword = configService.get('REDIS_PASSWORD') || 'advert123';

        // Build Redis URL from individual variables
        let redisUrl: string;
        if (redisUser) {
          redisUrl = `redis://${redisUser}:${redisPassword}@${redisHost}:${redisPort}`;
        } else {
          redisUrl = `redis://:${redisPassword}@${redisHost}:${redisPort}`;
        }

        const client = createClient({
          url: redisUrl,
        });

        client.on('error', (err) => console.error('Redis Client Error', err));

        await client.connect();
        console.log('✅ Redis connected');

        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [DATABASE_POOL, REDIS_CLIENT],
})
export class DatabaseModule {}
