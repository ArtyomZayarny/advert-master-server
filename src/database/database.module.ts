import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { createClient } from 'redis';
import { MongoClient, Db } from 'mongodb';

// PostgreSQL tokens
export const DATABASE_POOL = 'DATABASE_POOL';
export const POSTGRES_POOL = 'POSTGRES_POOL';

// Redis token
export const REDIS_CLIENT = 'REDIS_CLIENT';

// MongoDB tokens
export const MONGODB_CLIENT = 'MONGODB_CLIENT';
export const MONGODB_DATABASE = 'MONGODB_DATABASE';

@Global()
@Module({
  providers: [
    // PostgreSQL for auth
    {
      provide: DATABASE_POOL,
      useFactory: async (configService: ConfigService) => {
        const postgresUrl = configService.get<string>('POSTGRES_URL');
        
        let pool: Pool;
        if (postgresUrl && postgresUrl.trim()) {
          console.log('🔍 Using POSTGRES_URL for connection (auth)');
          pool = new Pool({
            connectionString: postgresUrl.trim(),
          });
        } else {
          const host = configService.get<string>('POSTGRES_HOST') || 'localhost';
          const port = parseInt(configService.get<string>('POSTGRES_PORT') || '5432', 10);
          const user = configService.get<string>('POSTGRES_USER') || 'advert';
          const password = configService.get<string>('POSTGRES_PASSWORD') || 'advert123';
          const database = configService.get<string>('POSTGRES_DB') || 'advert_auth';
          
          console.log(`🔍 Using individual POSTGRES vars (auth): ${host}:${port}/${database}`);
          
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
            // Проверяем, является ли хост Neon или другим облачным провайдером
            const isNeon = host.includes('neon.tech') || host.includes('aws.neon.tech');
            const isCloudProvider = isNeon || host.includes('.rds.amazonaws.com') || host.includes('.cloud');
            
            pool = new Pool({
              host: host,
              port: port,
              user: user,
              password: password,
              database: database,
              // Добавляем SSL для облачных провайдеров
              ssl: isCloudProvider ? {
                rejectUnauthorized: false, // Для Neon и других облачных БД
              } : undefined,
            });
          }
        }

        try {
          await pool.query('SELECT NOW()');
          console.log('✅ PostgreSQL connected (auth)');
        } catch (error) {
          console.error('❌ PostgreSQL connection error (auth):', error);
        }

        return pool;
      },
      inject: [ConfigService],
    },
    // PostgreSQL for user (can be same or different DB)
    {
      provide: POSTGRES_POOL,
      useFactory: async (configService: ConfigService) => {
        const postgresUrl = configService.get<string>('POSTGRES_URL');
        
        let pool: Pool;
        if (postgresUrl && postgresUrl.trim()) {
          console.log('🔍 Using POSTGRES_URL for connection (user)');
          pool = new Pool({
            connectionString: postgresUrl.trim(),
          });
        } else {
          const host = configService.get<string>('POSTGRES_HOST') || 'localhost';
          const port = parseInt(configService.get<string>('POSTGRES_PORT') || '5432', 10);
          const user = configService.get<string>('POSTGRES_USER') || 'advert';
          const password = configService.get<string>('POSTGRES_PASSWORD') || 'advert123';
          const database = configService.get<string>('POSTGRES_DB') || 'advert_user';
          
          console.log(`🔍 Using individual POSTGRES vars (user): ${host}:${port}/${database}`);
          
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
            // Проверяем, является ли хост Neon или другим облачным провайдером
            const isNeon = host.includes('neon.tech') || host.includes('aws.neon.tech');
            const isCloudProvider = isNeon || host.includes('.rds.amazonaws.com') || host.includes('.cloud');
            
            pool = new Pool({
              host: host,
              port: port,
              user: user,
              password: password,
              database: database,
              // Добавляем SSL для облачных провайдеров
              ssl: isCloudProvider ? {
                rejectUnauthorized: false, // Для Neon и других облачных БД
              } : undefined,
            });
          }
        }

        try {
          await pool.query('SELECT NOW()');
          console.log('✅ PostgreSQL connected (user)');
        } catch (error) {
          console.error('❌ PostgreSQL connection error (user):', error);
        }

        return pool;
      },
      inject: [ConfigService],
    },
    // Redis
    {
      provide: REDIS_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const redisHost = configService.get('REDIS_HOST') || 'localhost';
        const redisPort = configService.get('REDIS_PORT') || '6379';
        const redisUser = configService.get('REDIS_USER');
        const redisPassword = configService.get('REDIS_PASSWORD') || 'advert123';

        let redisUrl: string;
        if (redisUser) {
          redisUrl = `redis://${redisUser}:${redisPassword}@${redisHost}:${redisPort}`;
        } else {
          redisUrl = `redis://:${redisPassword}@${redisHost}:${redisPort}`;
        }

        const client = createClient({
          url: redisUrl,
          socket: {
            connectTimeout: 5000,
            reconnectStrategy: (retries) => {
              if (retries > 3) {
                console.warn('⚠️  Redis reconnection attempts exceeded, giving up');
                return false;
              }
              return Math.min(retries * 100, 3000);
            },
          },
        });

        client.on('error', (err) => {
          console.error('Redis Client Error:', err);
          // Don't throw, just log - Redis errors shouldn't crash the app
        });

        try {
          await Promise.race([
            client.connect(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Redis connection timeout')), 5000)
            ),
          ]);
          console.log('✅ Redis connected');
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error('❌ Redis connection error:', errorMessage);
          // In serverless environments, we might want to continue without Redis
          // Throw only if Redis is critical for the app to function
          if (process.env.REQUIRE_REDIS === 'true') {
            throw error;
          }
          console.warn('⚠️  Continuing without Redis connection - Redis features will be unavailable');
          // Still return the client - some operations might work with retries
        }

        return client;
      },
      inject: [ConfigService],
    },
    // MongoDB
    {
      provide: MONGODB_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const mongoUrl = configService.get<string>('MONGODB_URL');
        let url = (mongoUrl && mongoUrl.trim()) || 'mongodb://localhost:27017';
        
        url = url.endsWith('/') ? url.slice(0, -1) : url;
        
        console.log('🔍 MongoDB URL:', url.substring(0, 50) + (url.length > 50 ? '...' : ''));
        
        const client = new MongoClient(url, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
          // Add retry logic for serverless environments
          retryWrites: true,
          retryReads: true,
        });

        try {
          await Promise.race([
            client.connect(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('MongoDB connection timeout')), 5000)
            ),
          ]);
          console.log('✅ MongoDB connected');
          return client;
        } catch (error) {
          console.error('❌ MongoDB connection error:', error);
          // In serverless environments, we should still return the client
          // It will attempt to connect on first use (lazy connection)
          // Only throw if MongoDB is absolutely required
          if (process.env.REQUIRE_MONGODB === 'true') {
            throw error;
          }
          console.warn('⚠️  MongoDB connection failed, will retry on first use');
          // Return the client anyway - MongoDB driver supports lazy connections
          return client;
        }
      },
      inject: [ConfigService],
    },
    {
      provide: MONGODB_DATABASE,
      useFactory: async (client: MongoClient, configService: ConfigService) => {
        const dbName = configService.get('MONGODB_DB_NAME') || 'advert_adverts';
        return client.db(dbName);
      },
      inject: [MONGODB_CLIENT, ConfigService],
    },
  ],
  exports: [DATABASE_POOL, POSTGRES_POOL, REDIS_CLIENT, MONGODB_CLIENT, MONGODB_DATABASE],
})
export class DatabaseModule {}
