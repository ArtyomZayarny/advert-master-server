import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SearchController } from './search/search.controller';
import { RecommendationsController } from './recommendations/recommendations.controller';
import { CurrencyController } from './currency/currency.controller';
import { SearchService } from './search/search.service';
import { RecommendationsService } from './recommendations/recommendations.service';
import { CurrencyService } from './currency/currency.service';
import { DatabaseModule } from './database/database.module';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
  ],
  controllers: [SearchController, RecommendationsController, CurrencyController, HealthController],
  providers: [SearchService, RecommendationsService, CurrencyService],
})
export class AppModule {}
