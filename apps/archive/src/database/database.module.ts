import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MongoClient, Db } from 'mongodb';

export const MONGODB_CLIENT = 'MONGODB_CLIENT';
export const MONGODB_DATABASE = 'MONGODB_DATABASE';

@Global()
@Module({
  providers: [
    {
      provide: MONGODB_CLIENT,
      useFactory: async (configService: ConfigService) => {
        const mongoUrl = configService.get<string>('MONGODB_URL');
        let url = (mongoUrl && mongoUrl.trim()) || 'mongodb://localhost:27017';
        
        // Убираем trailing slash если есть
        url = url.endsWith('/') ? url.slice(0, -1) : url;
        
        console.log('🔍 MongoDB URL (archive):', url.substring(0, 50) + (url.length > 50 ? '...' : ''));
        
        const client = new MongoClient(url, {
          serverSelectionTimeoutMS: 5000,
          connectTimeoutMS: 5000,
        });

        try {
          await client.connect();
          console.log('✅ MongoDB connected (archive-service)');
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
        const dbName = configService.get('MONGODB_DB_NAME') || 'advert_archive';
        return client.db(dbName);
      },
      inject: [MONGODB_CLIENT, ConfigService],
    },
  ],
  exports: [MONGODB_CLIENT, MONGODB_DATABASE],
})
export class DatabaseModule {}
