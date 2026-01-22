// @ts-nocheck
/**
 * Utility for setting up ReDoc in NestJS with Express
 * Note: This file is not type-checked separately as it depends on NestJS modules
 * that are only available in the service contexts where it's imported.
 */
import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ReDocOptions } from './redoc.config';

export const setupReDoc = (
  app: any, // Using any to avoid type conflicts in monorepo
  config: {
    title: string;
    description: string;
    version: string;
    tags: Array<{ name: string; description: string }>;
    port: number;
    serviceName: string;
  },
  redocOptions?: ReDocOptions,
) => {
  // Создаем Swagger документ
  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.title)
    .setDescription(config.description)
    .setVersion(config.version)
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addServer(`http://localhost:${config.port}`, 'Development')
    .addServer(`https://api.advertmaster.com/${config.serviceName}`, 'Production');

  config.tags.forEach(tag => {
    swaggerConfig.addTag(tag.name, tag.description);
  });

  const document = SwaggerModule.createDocument(app, swaggerConfig.build());

  // Настраиваем ReDoc
  const expressInstance = app.getHttpAdapter().getInstance();
  
  // HTML для ReDoc
  const redocOptionsJson = JSON.stringify(redocOptions || {}, null, 2);
  const redocHtml = `<!DOCTYPE html>
<html>
  <head>
    <title>${config.title}</title>
    <meta charset="utf-8"/>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    <style>
      body {
        margin: 0;
        padding: 0;
      }
    </style>
  </head>
  <body>
    <div id="redoc-container"></div>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
    <script>
      Redoc.init('/api/swagger-json', ${redocOptionsJson}, document.getElementById('redoc-container'));
    </script>
  </body>
</html>`;

  // Регистрируем маршруты для ReDoc
  expressInstance.get('/api/docs', (req, res) => {
    res.type('text/html').send(redocHtml);
  });

  // JSON endpoint для ReDoc
  expressInstance.get('/api/swagger-json', (req, res) => {
    res.json(document);
  });

  // JSON endpoint для скачивания
  expressInstance.get('/api/swagger.json', (req, res) => {
    res.json(document);
  });

  // YAML endpoint (опционально)
  expressInstance.get('/api/swagger.yaml', (req, res) => {
    // Можно добавить конвертацию в YAML если нужно
    res.type('application/yaml').send(JSON.stringify(document, null, 2));
  });

  return document;
};
