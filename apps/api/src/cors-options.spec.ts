import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { createCorsOptions } from './cors-options';

describe('createCorsOptions', () => {
  it('limits cross-origin methods and headers to the current API', () => {
    expect(createCorsOptions('https://portfolio.example')).toMatchObject({
      methods: ['GET', 'POST'],
      allowedHeaders: ['Content-Type'],
    });
  });

  it.each([undefined, '*', 'https://portfolio.example/', 'file://localhost'])(
    'rejects an invalid or overly broad WEB_ORIGIN: %s',
    (webOrigin) => {
      expect(() => createCorsOptions(webOrigin)).toThrow();
    },
  );

  describe('HTTP CORS behavior', () => {
    const webOrigin = 'http://localhost:3000';
    let app: INestApplication;
    let baseUrl: string;

    beforeEach(async () => {
      const moduleRef = await Test.createTestingModule({}).compile();

      app = moduleRef.createNestApplication();
      app.enableCors(createCorsOptions(webOrigin));
      await app.listen(0, '127.0.0.1');
      baseUrl = await app.getUrl();
    });

    afterEach(async () => {
      await app.close();
    });

    it('allows the configured web origin to make a JSON POST preflight request', async () => {
      const response = await fetch(`${baseUrl}/`, {
        method: 'OPTIONS',
        headers: {
          origin: webOrigin,
          'access-control-request-method': 'POST',
          'access-control-request-headers': 'content-type',
        },
      });

      expect(response.status).toBe(204);
      expect(response.headers.get('access-control-allow-origin')).toBe(webOrigin);
      expect(response.headers.get('access-control-allow-methods')).toContain('POST');
      expect(response.headers.get('access-control-allow-headers')).toContain('Content-Type');
    });

    it('does not grant CORS access to an unconfigured web origin', async () => {
      const response = await fetch(`${baseUrl}/`, {
        headers: { origin: 'https://untrusted.example' },
      });

      expect(response.status).toBe(404);
      expect(response.headers.get('access-control-allow-origin')).toBeNull();
    });
  });
});
