import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { ListDemandsQueryDto } from './list-demands-query.dto';

describe('ListDemandsQueryDto', () => {
  it('uses the default page and page size', async () => {
    const query = plainToInstance(ListDemandsQueryDto, {});

    expect(query).toMatchObject({ page: 1, pageSize: 20 });
    expect(await validate(query)).toEqual([]);
  });

  it('transforms numeric query strings to integers', async () => {
    const query = plainToInstance(ListDemandsQueryDto, { page: '2', pageSize: '50' });

    expect(query).toMatchObject({ page: 2, pageSize: 50 });
    expect(await validate(query)).toEqual([]);
  });

  it('allows the maximum page size', async () => {
    const query = plainToInstance(ListDemandsQueryDto, { pageSize: '100' });

    expect(query.pageSize).toBe(100);
    expect(await validate(query)).toEqual([]);
  });

  it.each([
    { page: '0' },
    { page: '-1' },
    { page: '1.5' },
    { page: 'invalid' },
    { page: '9007199254740992' },
    { pageSize: '0' },
    { pageSize: '101' },
    { pageSize: '1.5' },
    { pageSize: 'invalid' },
  ])('rejects invalid pagination values: %o', async (queryValues) => {
    const query = plainToInstance(ListDemandsQueryDto, queryValues);

    expect(await validate(query)).not.toEqual([]);
  });
});
