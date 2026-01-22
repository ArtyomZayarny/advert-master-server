import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { MongoClient, Db } from 'mongodb';

export const POSTGRES_POOL = 'POSTGRES_POOL';
export const MONGODB_CLIENT = 'MONGODB_CLIENT';
export const MONGODB_DATABASE = 'MONGODB_DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: POSTGRES_POOL,
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
          const database = configService.get<string>('POSTGRES_DB') || 'advert_user';
          
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

        try {
          await pool.query('SELECT NOW()');
          console.log('✅ PostgreSQL connected (user-service)');
        } catch (error) {
          console.error('❌ PostgreSQL connection error:', error);
        }

        return pool;
      },
      inject: [ConfigService],
    },
    {
      provide: MONGODB_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const mongoUrl = configService.get<string>('MONGODB_URL');
        let url = (mongoUrl && mongoUrl.trim()) || 'mongodb://localhost:27017';
        
        // Убираем trailing slash если есть
        url = url.endsWith('/') ? url.slice(0, -1) : url;
        
        console.log('🔍 MongoDB URL (user):', url.substring(0, 50) + (url.length > 50 ? '...' : ''));
        
        const client = new MongoClient(url, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });

        try {
          await client.connect();
          console.log('✅ MongoDB connected (user-service)');
          return client;
        } catch (error) {
          console.error('❌ MongoDB connection error:', error);
          throw error;
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
  exports: [POSTGRES_POOL, MONGODB_CLIENT, MONGODB_DATABASE],
})
export class DatabaseModule {}
