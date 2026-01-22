import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
    rawBody: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: false,
      disableErrorMessages: false,
    }),
  );

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGIN || 'https://kibtop.online'
      : ['http://localhost:3000', 'http://localhost:3001', 'https://kibtop.online'],
    credentials: true,
  });

  const configService = app.get(ConfigService);
  
  // Подключение TCP микросервиса для валидации токенов
  app.connectMicroservice({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: configService.get('TCP_PORT') || 3001,
    },
  });

  const port = process.env.PORT || 3001;
  
  await app.startAllMicroservices();
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Auth Service is running on http://0.0.0.0:${port}`);
  console.log(`🔌 TCP Microservice listening on port ${configService.get('TCP_PORT') || 3001}`);
}

bootstrap();
