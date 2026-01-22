import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express, { Request, Response } from 'express';
import { ValidationPipe } from '@nestjs/common';

let cachedServer: express.Express | null = null;
let initializationError: Error | null = null;

async function bootstrap() {
  // Return cached server if available
  if (cachedServer) {
    return cachedServer;
  }

  // If we've already tried and failed, throw the cached error
  if (initializationError) {
    throw initializationError;
  }

  try {
    console.log('🚀 Starting NestJS app initialization...');
    console.log('📊 Environment:', {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL ? 'true' : 'false',
      hasPostgres: !!process.env.POSTGRES_URL || !!process.env.POSTGRES_HOST,
      hasMongo: !!process.env.MONGODB_URL,
      hasRedis: !!process.env.REDIS_HOST,
    });

    const server = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
      bodyParser: true,
      rawBody: true,
      logger: process.env.NODE_ENV === 'production' ? false : ['error', 'warn', 'log'],
      abortOnError: false,
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

    await app.init();
    console.log('✅ NestJS app initialized successfully');
    
    cachedServer = server;
    return server;
  } catch (error) {
    // Cache the error so we don't retry on every request
    initializationError = error as Error;
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : 'Error',
    };
    console.error('❌ Failed to initialize NestJS app:', JSON.stringify(errorDetails, null, 2));
    throw error;
  }
}

export default async function handler(req: Request, res: Response) {
  try {
    if (!cachedServer) {
      await bootstrap();
    }
    return cachedServer!(req as any, res as any);
  } catch (error) {
    // Ensure we always send a response, even on errors
    if (!res.headersSent) {
      const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
      const errorStack = process.env.NODE_ENV === 'development' && error instanceof Error 
        ? error.stack 
        : undefined;

      console.error('❌ Serverless function error:', {
        message: errorMessage,
        stack: errorStack,
        path: req.url,
        method: req.method,
      });

      res.status(500).json({
        error: 'FUNCTION_INVOCATION_FAILED',
        message: process.env.NODE_ENV === 'production' 
          ? 'Internal server error' 
          : errorMessage,
        ...(errorStack && { stack: errorStack }),
      });
    }
  }
}
