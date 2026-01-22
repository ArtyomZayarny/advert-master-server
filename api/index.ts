import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import * as express from 'express';
import { ValidationPipe } from '@nestjs/common';

let cachedApp: any;
let initializationError: Error | null = null;

async function createApp() {
  // Return cached app if available
  if (cachedApp) {
    return cachedApp;
  }

  // If we've already tried and failed, throw the cached error
  if (initializationError) {
    throw initializationError;
  }

  try {
    const expressApp = express();
    const adapter = new ExpressAdapter(expressApp);
    
    const app = await NestFactory.create(AppModule, adapter, {
      bodyParser: true,
      rawBody: true,
      logger: process.env.NODE_ENV === 'production' ? false : ['error', 'warn', 'log'],
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
    cachedApp = expressApp;
    return expressApp;
  } catch (error) {
    // Cache the error so we don't retry on every request
    initializationError = error as Error;
    console.error('❌ Failed to initialize NestJS app:', error);
    throw error;
  }
}

export default async function handler(req: any, res: any) {
  try {
    const app = await createApp();
    return app(req, res);
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
