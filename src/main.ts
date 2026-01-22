import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

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

  const port = process.env.PORT || 3001;
  await app.listen(port, '0.0.0.0');
  console.log(`🚀 Advert Master Server is running on http://0.0.0.0:${port}`);
  console.log(`📊 Health check: http://0.0.0.0:${port}/health`);
}

bootstrap();
