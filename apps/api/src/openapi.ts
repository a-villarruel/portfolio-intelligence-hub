import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

const openApiConfig = new DocumentBuilder()
  .setTitle('Portfolio Intelligence Hub API')
  .setDescription('API contract for the Portfolio Intelligence Hub.')
  .setVersion('1.0.0')
  .build();

export function createOpenApiDocument(app: INestApplication) {
  return SwaggerModule.createDocument(app, openApiConfig);
}
