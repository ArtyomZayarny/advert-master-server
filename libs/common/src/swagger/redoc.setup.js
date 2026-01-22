"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupReDoc = void 0;
const swagger_1 = require("@nestjs/swagger");
const setupReDoc = (app, config, redocOptions) => {
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle(config.title)
        .setDescription(config.description)
        .setVersion(config.version)
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
    }, 'JWT-auth')
        .addServer(`http://localhost:${config.port}`, 'Development')
        .addServer(`https://api.advertmaster.com/${config.serviceName}`, 'Production');
    config.tags.forEach(tag => {
        swaggerConfig.addTag(tag.name, tag.description);
    });
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig.build());
    swagger_1.SwaggerModule.setup('api/swagger', app, document, {
        customSiteTitle: `${config.title} - Swagger`,
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            filter: true,
        },
    });
    const fastifyInstance = app.getHttpAdapter().getInstance();
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
    fastifyInstance.get('/api/docs', async (request, reply) => {
        reply.type('text/html').send(redocHtml);
    });
    fastifyInstance.get('/api/swagger-json', async (request, reply) => {
        reply.send(document);
    });
    fastifyInstance.get('/api/swagger.json', async (request, reply) => {
        reply.send(document);
    });
    fastifyInstance.get('/api/swagger.yaml', async (request, reply) => {
        reply.type('application/yaml').send(JSON.stringify(document, null, 2));
    });
    return document;
};
exports.setupReDoc = setupReDoc;
//# sourceMappingURL=redoc.setup.js.map