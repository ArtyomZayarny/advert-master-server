import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';
import { FavoritesService } from './favorites/favorites.service';
import { DatabaseModule } from './database/database.module';
import { JwtService } from './jwt/jwt.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
  ],
  controllers: [UserController, HealthController],
  providers: [UserService, FavoritesService, JwtService],
})
export class AppModule {}
