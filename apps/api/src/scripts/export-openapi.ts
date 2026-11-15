import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { config } from 'dotenv';
import { createApp } from '../create-app';
import { createOpenApiDocument } from '../openapi';

config({ path: resolve(process.cwd(), '../../.env') });

async function exportOpenApi(): Promise<void> {
  const app = await createApp();

  try {
    const document = createOpenApiDocument(app);
    await writeFile(
      resolve(process.cwd(), 'openapi.json'),
      `${JSON.stringify(document, null, 2)}\n`,
      'utf8',
    );
  } finally {
    await app.close();
  }
}

void exportOpenApi();
