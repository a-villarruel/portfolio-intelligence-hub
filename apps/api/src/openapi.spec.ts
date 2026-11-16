import { Test } from '@nestjs/testing';
import { describe, expect, it } from 'vitest';
import { AppModule } from './app.module';
import { PrismaService } from './database/prisma.service';
import { createOpenApiDocument } from './openapi';

describe('OpenAPI contract', () => {
  it('documents demand pagination query parameters as integers', async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] })
      .overrideProvider(PrismaService)
      .useValue({})
      .compile();
    const app = moduleRef.createNestApplication();

    try {
      app.setGlobalPrefix('api');
      await app.init();
      const document = createOpenApiDocument(app);
      const parameters = document.paths['/api/demands']?.get?.parameters;
      const paginatedResponse = document.components?.schemas?.PaginatedDemandsResponseDto;

      expect(parameters).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'page',
            in: 'query',
            schema: expect.objectContaining({ type: 'integer' }),
          }),
          expect.objectContaining({
            name: 'pageSize',
            in: 'query',
            schema: expect.objectContaining({ type: 'integer' }),
          }),
        ]),
      );
      expect(paginatedResponse).toMatchObject({
        properties: {
          page: { type: 'integer' },
          pageSize: { type: 'integer' },
          total: { type: 'integer' },
          totalPages: { type: 'integer' },
        },
      });
    } finally {
      await app.close();
    }
  });
});
