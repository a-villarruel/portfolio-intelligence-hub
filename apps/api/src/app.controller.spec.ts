import { describe, expect, it } from 'vitest';
import { AppController } from './app.controller';

describe('AppController', () => {
  it('reports the API as available', () => {
    expect(new AppController().health()).toEqual({ status: 'ok' });
  });
});
