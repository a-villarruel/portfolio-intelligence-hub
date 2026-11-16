import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ItDemandController } from './it-demand.controller';
import { ItDemandService } from './it-demand.service';

describe('ItDemandController HTTP boundary', () => {
  const demandService = {
    create: vi.fn(),
    findAll: vi.fn(),
  };
  let app: INestApplication;
  let baseUrl: string;

  beforeEach(async () => {
    demandService.create.mockReset();
    demandService.findAll.mockReset();

    const moduleRef = await Test.createTestingModule({
      controllers: [ItDemandController],
      providers: [{ provide: ItDemandService, useValue: demandService }],
    }).compile();

    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.listen(0, '127.0.0.1');
    baseUrl = await app.getUrl();
  });

  afterEach(async () => {
    await app.close();
  });

  it('creates a demand with HTTP 201 and returns only the approved response fields', async () => {
    const demand = {
      id: '4c4a59ae-a20a-43c9-a44f-f2d53cf31c81',
      title: 'Replace reporting',
      description: 'Unsupported tool delays close.',
      requesterName: 'Alex Morgan',
      status: 'New',
      createdAt: '2026-11-15T12:00:00.000Z',
      updatedAt: '2026-11-15T12:00:00.000Z',
    };
    demandService.create.mockResolvedValue(demand);

    const response = await fetch(`${baseUrl}/api/demands`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: '  Replace reporting  ',
        description: '  Unsupported tool delays close.  ',
        requesterName: '  Alex Morgan  ',
        status: 'Rejected',
      }),
    });

    expect(response.status).toBe(201);
    expect(await response.json()).toEqual(demand);
    expect(demandService.create).toHaveBeenCalledWith({
      title: 'Replace reporting',
      description: 'Unsupported tool delays close.',
      requesterName: 'Alex Morgan',
    });
  });

  it('returns the paginated inline demand response from GET', async () => {
    const page = {
      items: [
        {
          id: '4c4a59ae-a20a-43c9-a44f-f2d53cf31c81',
          title: 'Replace reporting',
          description: 'Unsupported tool delays close.',
          requesterName: 'Alex Morgan',
          status: 'New',
          createdAt: '2026-11-15T12:00:00.000Z',
          updatedAt: '2026-11-15T12:00:00.000Z',
        },
      ],
      page: 2,
      pageSize: 20,
      total: 21,
      totalPages: 2,
    };
    demandService.findAll.mockResolvedValue(page);

    const response = await fetch(`${baseUrl}/api/demands?page=2&pageSize=20`);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(page);
    expect(demandService.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ page: 2, pageSize: 20 }),
    );
  });

  it('returns HTTP 400 for an invalid create body', async () => {
    const response = await fetch(`${baseUrl}/api/demands`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        title: ' \t\n',
        description: 'Valid description',
        requesterName: 'Alex',
      }),
    });

    expect(response.status).toBe(400);
    expect(demandService.create).not.toHaveBeenCalled();
  });

  it('returns HTTP 400 for invalid pagination query parameters', async () => {
    const response = await fetch(`${baseUrl}/api/demands?page=1&pageSize=101`);

    expect(response.status).toBe(400);
    expect(demandService.findAll).not.toHaveBeenCalled();
  });
});
