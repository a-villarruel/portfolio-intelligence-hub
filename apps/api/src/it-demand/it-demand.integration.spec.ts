import { config } from 'dotenv';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';
import { PrismaService } from '../database/prisma.service';
import { ItDemandService } from './it-demand.service';

config({ path: resolve(process.cwd(), '../../.env') });

const TEST_DATABASE_NAME = 'portfolio_intelligence_hub_test';

function getTestDatabaseUrl(testDatabaseUrl: string | undefined): string | undefined {
  if (!testDatabaseUrl) {
    return undefined;
  }

  const databaseName = decodeURIComponent(new URL(testDatabaseUrl).pathname.slice(1));

  if (databaseName !== TEST_DATABASE_NAME) {
    throw new Error(
      `IT Demand integration tests require a database named "${TEST_DATABASE_NAME}".`,
    );
  }

  return testDatabaseUrl;
}

describe('IT Demand test database guard', () => {
  it('does not fall back when TEST_DATABASE_URL is absent', () => {
    expect(getTestDatabaseUrl(undefined)).toBeUndefined();
  });

  it('accepts only the dedicated IT Demand test database', () => {
    const url = 'postgresql://user:password@localhost:5432/portfolio_intelligence_hub_test';

    expect(getTestDatabaseUrl(url)).toBe(url);
  });

  it.each([
    'postgresql://user:password@localhost:5432/portfolio_intelligence_hub',
    'postgresql://user:password@localhost:5432/production',
    'not-a-database-url',
  ])('refuses an unrecognized test database URL: %s', (url) => {
    expect(() => getTestDatabaseUrl(url)).toThrow();
  });
});

const testDatabaseUrl = getTestDatabaseUrl(process.env.TEST_DATABASE_URL);
const postgresDescribe = testDatabaseUrl ? describe : describe.skip;

postgresDescribe('IT Demand PostgreSQL integration', () => {
  const cleanupMarker = `it-demand-${randomUUID()}`;
  let prisma: PrismaService;
  let service: ItDemandService;
  let createdIds: string[] = [];
  let originalDatabaseUrl: string | undefined;

  beforeAll(async () => {
    if (!testDatabaseUrl) {
      throw new Error('TEST_DATABASE_URL must be set to run PostgreSQL integration tests.');
    }

    originalDatabaseUrl = process.env.DATABASE_URL;
    process.env.DATABASE_URL = testDatabaseUrl;
    prisma = new PrismaService();
    await prisma.$connect();
    service = new ItDemandService(prisma);
  });

  afterEach(async () => {
    await prisma.demand.deleteMany({
      where: {
        OR: [
          { id: { in: createdIds } },
          { title: { startsWith: cleanupMarker } },
          { requesterName: { startsWith: cleanupMarker } },
        ],
      },
    });
    createdIds = [];
  });

  afterAll(async () => {
    try {
      if (prisma) {
        await prisma.$disconnect();
      }
    } finally {
      if (originalDatabaseUrl === undefined) {
        delete process.env.DATABASE_URL;
      } else {
        process.env.DATABASE_URL = originalDatabaseUrl;
      }
    }
  });

  it('persists full demands, applies the New default, and enforces database constraints', async () => {
    const created = await service.create({
      title: 'T'.repeat(120),
      description: 'D'.repeat(4000),
      requesterName: cleanupMarker.padEnd(120, 'R'),
    });
    createdIds.push(created.id);

    expect(created).toMatchObject({
      title: 'T'.repeat(120),
      description: 'D'.repeat(4000),
      requesterName: cleanupMarker.padEnd(120, 'R'),
      status: 'New',
    });
    expect(created.createdAt).toBeInstanceOf(Date);
    expect(created.updatedAt).toBeInstanceOf(Date);

    const page = await service.findAll({ page: 1, pageSize: 20 });
    expect(page.items).toContainEqual(expect.objectContaining({ id: created.id }));

    await expect(
      prisma.demand.create({
        data: {
          title: 'T'.repeat(121),
          description: 'Valid description',
          requesterName: `${cleanupMarker}-invalid-title`,
        },
      }),
    ).rejects.toMatchObject({
      code: 'P2000',
      meta: expect.objectContaining({ column: 'title' }),
    });
    await expect(
      prisma.demand.create({
        data: {
          title: 'Valid title',
          description: 'D'.repeat(4001),
          requesterName: `${cleanupMarker}-invalid-description`,
        },
      }),
    ).rejects.toMatchObject({
      code: 'P2000',
      meta: expect.objectContaining({ column: 'description' }),
    });
    await expect(
      prisma.demand.create({
        data: {
          title: `${cleanupMarker}-invalid-requester`,
          description: 'Valid description',
          requesterName: `${cleanupMarker}${'R'.repeat(121 - cleanupMarker.length)}`,
        },
      }),
    ).rejects.toMatchObject({
      code: 'P2000',
      meta: expect.objectContaining({ column: 'requesterName' }),
    });
    await expect(
      prisma.demand.create({
        data: {
          title: ' \t\n',
          description: 'Valid description',
          requesterName: `${cleanupMarker}-blank-title`,
        },
      }),
    ).rejects.toMatchObject({
      code: 'P2004',
      meta: expect.objectContaining({
        database_error: expect.stringContaining('Demand_title_nonempty_check'),
      }),
    });
    await expect(
      prisma.demand.create({
        data: {
          title: `${cleanupMarker}-blank-description`,
          description: ' \t\n',
          requesterName: `${cleanupMarker}-blank-description`,
        },
      }),
    ).rejects.toMatchObject({
      code: 'P2004',
      meta: expect.objectContaining({
        database_error: expect.stringContaining('Demand_description_nonempty_check'),
      }),
    });
    await expect(
      prisma.demand.create({
        data: {
          title: `${cleanupMarker}-blank-requester`,
          description: 'Valid description',
          requesterName: ' \t\n',
        },
      }),
    ).rejects.toMatchObject({
      code: 'P2004',
      meta: expect.objectContaining({
        database_error: expect.stringContaining('Demand_requesterName_nonempty_check'),
      }),
    });
  });
});
