import { DocumentBuilder } from '@nestjs/swagger';

export interface SwaggerServiceConfig {
  title: string;
  description: string;
  version: string;
  tags: Array<{ name: string; description: string }>;
  port: number;
  serviceName: string;
}

export const createSwaggerConfig = (config: SwaggerServiceConfig) => {
  const builder = new DocumentBuilder()
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
    builder.addTag(tag.name, tag.description);
  });

  return builder.build();
};
