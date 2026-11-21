import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

export function createCorsOptions(webOrigin: string | undefined): CorsOptions {
  if (!webOrigin) {
    throw new Error('WEB_ORIGIN must be set to configure API CORS.');
  }

  let origin: URL;

  try {
    origin = new URL(webOrigin);
  } catch {
    throw new Error('WEB_ORIGIN must be a valid HTTP or HTTPS origin.');
  }

  if (
    (origin.protocol !== 'http:' && origin.protocol !== 'https:') ||
    origin.origin !== webOrigin
  ) {
    throw new Error('WEB_ORIGIN must be a valid HTTP or HTTPS origin without a path.');
  }

  return {
    origin: (requestOrigin, callback) => callback(null, requestOrigin === webOrigin),
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type'],
  };
}
