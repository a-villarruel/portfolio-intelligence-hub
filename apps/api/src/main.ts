import { config } from 'dotenv';
import { resolve } from 'node:path';
import { createApp } from './create-app';

config({ path: resolve(process.cwd(), '../../.env') });

async function bootstrap(): Promise<void> {
  const app = await createApp();
  const port = Number(process.env.API_PORT ?? 4000);

  await app.listen(port);
}

void bootstrap();
