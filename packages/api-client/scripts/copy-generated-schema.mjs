import { copyFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const packageDirectory = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const source = resolve(packageDirectory, 'src/generated/schema.d.ts');
const destination = resolve(packageDirectory, 'dist/generated/schema.d.ts');

mkdirSync(dirname(destination), { recursive: true });
copyFileSync(source, destination);
