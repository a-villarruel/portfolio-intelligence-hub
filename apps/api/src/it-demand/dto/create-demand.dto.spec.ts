import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { describe, expect, it } from 'vitest';
import { CreateDemandDto } from './create-demand.dto';

describe('CreateDemandDto', () => {
  it('accepts each maximum field length', async () => {
    const input = plainToInstance(CreateDemandDto, {
      title: 't'.repeat(120),
      description: 'd'.repeat(4000),
      requesterName: 'r'.repeat(120),
    });

    expect(await validate(input)).toEqual([]);
  });

  it('trims all fields before validating them', async () => {
    const input = plainToInstance(CreateDemandDto, {
      title: '  Replace reporting  ',
      description: '  Unsupported tool delays close.  ',
      requesterName: '  Alex Morgan  ',
    });

    expect(await validate(input)).toEqual([]);
    expect(input).toMatchObject({
      title: 'Replace reporting',
      description: 'Unsupported tool delays close.',
      requesterName: 'Alex Morgan',
    });
  });

  it.each([
    ['title', 't'.repeat(121)],
    ['description', 'd'.repeat(4001)],
    ['requesterName', 'r'.repeat(121)],
  ])('rejects %s above its maximum length', async (field, value) => {
    const input = plainToInstance(CreateDemandDto, {
      title: 'Demand',
      description: 'A business need',
      requesterName: 'Alex',
      [field]: value,
    });

    expect(await validate(input)).toContainEqual(expect.objectContaining({ property: field }));
  });

  it.each(['title', 'description', 'requesterName'])(
    'rejects a blank %s after trimming',
    async (field) => {
      const input = plainToInstance(CreateDemandDto, {
        title: 'Demand',
        description: 'A business need',
        requesterName: 'Alex',
        [field]: '   ',
      });

      expect(await validate(input)).toContainEqual(expect.objectContaining({ property: field }));
    },
  );
});
