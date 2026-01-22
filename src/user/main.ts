import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
      forbidNonWhitelisted: false,
    }),
  );

  app.enableCors({
    origin: process.env.NODE_ENV === 'production' 
      ? process.env.ALLOWED_ORIGIN || 'https://kibtop.online'
      : ['http://localhost:3000', 'http://localhost:3001', 'https://kibtop.online'],
    credentials: true,
  });

  const port = process.env.PORT || 3003;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 User Service is running on http://0.0.0.0:${port}`);
}

bootstrap();
