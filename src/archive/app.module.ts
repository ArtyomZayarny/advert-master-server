import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ArchiveController } from './archive/archive.controller';
import { ArchiveService } from './archive/archive.service';
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
  controllers: [ArchiveController, HealthController],
  providers: [ArchiveService],
})
export class AppModule {}
