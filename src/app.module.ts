import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';

// Database
import { DatabaseModule } from './database/database.module';

// Auth
import { AuthController } from './auth/auth/auth.controller';
import { SocialAuthController } from './auth/auth/social-auth.controller';
import { AuthService } from './auth/auth/auth.service';
import { UserService } from './auth/user/user.service';
import { JwtService } from './common/jwt.service';
import { FileService as AuthFileService } from './auth/file/file.service';

// Adverts
import { AdvertsController, MainController, RecommendationsController, AdvertsByIdController } from './adverts/adverts/adverts.controller';
import { AdvertsService } from './adverts/adverts/adverts.service';
import { FileService as AdvertsFileService } from './adverts/file/file.service';
import { AdvertUpdaterService } from './adverts/cron/advert-updater.service';

// User
import { UserController } from './user/user/user.controller';
import { UserService as UserUserService } from './user/user/user.service';
import { FavoritesService } from './user/favorites/favorites.service';

// Search
import { SearchController } from './search/search/search.controller';
import { SearchService } from './search/search/search.service';
import { RecommendationsController as SearchRecommendationsController } from './search/recommendations/recommendations.controller';
import { RecommendationsService } from './search/recommendations/recommendations.service';
import { CurrencyController } from './search/currency/currency.controller';
import { CurrencyService } from './search/currency/currency.service';

// Payments
import { PaymentsController } from './payments/payments/payments.controller';
import { PaymentsService } from './payments/payments/payments.service';

// Archive
import { ArchiveController } from './archive/archive/archive.controller';
import { ArchiveService } from './archive/archive/archive.service';

// Health
import { HealthController } from './health/health.controller';

// App
import { AppController } from './app.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
  ],
  controllers: [
    // App
    AppController,
    // Auth
    AuthController,
    SocialAuthController,
    // Adverts
    AdvertsController,
    AdvertsByIdController,
    MainController,
    RecommendationsController,
    // User
    UserController,
    // Search
    SearchController,
    SearchRecommendationsController,
    CurrencyController,
    // Payments
    PaymentsController,
    // Archive
    ArchiveController,
    // Health
    HealthController,
  ],
  providers: [
    // Common
    JwtService,
    // Auth
    AuthService,
    UserService,
    AuthFileService,
    // Adverts
    AdvertsService,
    AdvertsFileService,
    AdvertUpdaterService,
    // User
    UserUserService,
    FavoritesService,
    // Search
    SearchService,
    RecommendationsService,
    CurrencyService,
    // Payments
    PaymentsService,
    // Archive
    ArchiveService,
  ],
})
export class AppModule implements OnModuleInit {
  constructor(private userService: UserService) {}

  async onModuleInit() {
    // Initialize database table on startup
    try {
      await this.userService.createTable();
      console.log('✅ Users table initialized');
    } catch (error) {
      console.error('❌ Failed to initialize users table:', error);
    }
  }
}
