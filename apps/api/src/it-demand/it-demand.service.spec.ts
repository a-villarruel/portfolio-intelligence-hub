import { Test } from '@nestjs/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { ItDemandService } from './it-demand.service';

describe('ItDemandService', () => {
  const create = vi.fn();
  const findMany = vi.fn();
  const count = vi.fn();
  let service: ItDemandService;

  beforeEach(async () => {
    create.mockReset();
    findMany.mockReset();
    count.mockReset();

    const moduleRef = await Test.createTestingModule({
      providers: [
        ItDemandService,
        {
          provide: PrismaService,
          useValue: { demand: { create, findMany, count } },
        },
      ],
    }).compile();

    service = moduleRef.get(ItDemandService);
  });

  it('creates a demand from trimmed fields and leaves status server-assigned', async () => {
    const created = {
      id: 'demand-id',
      title: 'Replace reporting',
      description: 'Unsupported tool delays close.',
      requesterName: 'Alex Morgan',
      status: 'New',
      createdAt: new Date('2026-11-15T12:00:00.000Z'),
      updatedAt: new Date('2026-11-15T12:00:00.000Z'),
      internalNote: 'must not be exposed',
    };
    create.mockResolvedValue(created);

    await expect(
      service.create({
        title: '  Replace reporting  ',
        description: '  Unsupported tool delays close.  ',
        requesterName: '  Alex Morgan  ',
      }),
    ).resolves.toEqual({
      id: 'demand-id',
      title: 'Replace reporting',
      description: 'Unsupported tool delays close.',
      requesterName: 'Alex Morgan',
      status: 'New',
      createdAt: new Date('2026-11-15T12:00:00.000Z'),
      updatedAt: new Date('2026-11-15T12:00:00.000Z'),
    });

    expect(create).toHaveBeenCalledWith({
      data: {
        title: 'Replace reporting',
        description: 'Unsupported tool delays close.',
        requesterName: 'Alex Morgan',
      },
      select: {
        id: true,
        title: true,
        description: true,
        requesterName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('returns a recent-first page with complete demand records and metadata', async () => {
    const record = {
      id: 'demand-id',
      title: 'Replace reporting',
      description: 'Unsupported tool delays close.',
      requesterName: 'Alex Morgan',
      status: 'New',
      createdAt: new Date('2026-11-15T12:00:00.000Z'),
      updatedAt: new Date('2026-11-15T12:00:00.000Z'),
      internalNote: 'must not be exposed',
    };
    findMany.mockResolvedValue([record]);
    count.mockResolvedValue(21);

    const result = await service.findAll({ page: 2, pageSize: 20 });

    expect(result).toEqual({
      items: [
        {
          id: 'demand-id',
          title: 'Replace reporting',
          description: 'Unsupported tool delays close.',
          requesterName: 'Alex Morgan',
          status: 'New',
          createdAt: new Date('2026-11-15T12:00:00.000Z'),
          updatedAt: new Date('2026-11-15T12:00:00.000Z'),
        },
      ],
      page: 2,
      pageSize: 20,
      total: 21,
      totalPages: 2,
    });

    expect(findMany).toHaveBeenCalledWith({
      skip: 20,
      take: 20,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      select: {
        id: true,
        title: true,
        description: true,
        requesterName: true,
        status: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    expect(Object.keys(result.items[0] ?? {}).sort()).toEqual([
      'createdAt',
      'description',
      'id',
      'requesterName',
      'status',
      'title',
      'updatedAt',
    ]);
  });

  it('returns an empty list with pagination metadata when the page is past the end', async () => {
    count.mockResolvedValue(1);

    await expect(service.findAll({ page: 2, pageSize: 1 })).resolves.toEqual({
      items: [],
      page: 2,
      pageSize: 1,
      total: 1,
      totalPages: 1,
    });

    expect(findMany).not.toHaveBeenCalled();
  });

  it('returns an empty page when the requested offset cannot be represented safely', async () => {
    count.mockResolvedValue(0);

    await expect(
      service.findAll({ page: Number.MAX_SAFE_INTEGER, pageSize: 100 }),
    ).resolves.toMatchObject({
      items: [],
      page: Number.MAX_SAFE_INTEGER,
      pageSize: 100,
      total: 0,
      totalPages: 0,
    });

    expect(findMany).not.toHaveBeenCalled();
  });
});
