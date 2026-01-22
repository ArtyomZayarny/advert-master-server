import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PaymentsController } from './payments/payments.controller';
import { PaymentsService } from './payments/payments.service';
import { JwtService } from './jwt/jwt.service';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
  ],
  controllers: [PaymentsController, HealthController],
  providers: [PaymentsService, JwtService],
})
export class AppModule {}
