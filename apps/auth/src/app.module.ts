import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthController } from './auth/auth.controller';
import { SocialAuthController } from './auth/social-auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtService } from './jwt/jwt.service';
import { DatabaseModule } from './database/database.module';
import { UserService } from './user/user.service';
import { FileService } from './file/file.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    DatabaseModule,
  ],
  controllers: [AuthController, SocialAuthController, HealthController],
  providers: [AuthService, JwtService, UserService, FileService],
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
