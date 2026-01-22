import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { AdvertsController, MainController, RecommendationsController, AdvertsByIdController } from './adverts/adverts.controller';
import { AdvertsService } from './adverts/adverts.service';
import { DatabaseModule } from './database/database.module';
import { FileService } from './file/file.service';
import { AdvertUpdaterService } from './cron/advert-updater.service';
import { JwtService } from './jwt/jwt.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
  ],
  controllers: [AdvertsController, AdvertsByIdController, MainController, RecommendationsController, HealthController],
  providers: [AdvertsService, FileService, AdvertUpdaterService, JwtService],
})
export class AppModule {}
