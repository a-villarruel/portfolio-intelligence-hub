# Local development

## Prerequisites

- Node.js 24 LTS and pnpm 12.
- Docker Desktop or another Docker Compose-compatible runtime.

## Setup

1. Use Corepack to install dependencies with `corepack pnpm install`.
2. Copy `.env.example` to `.env` at the repository root.
3. Start PostgreSQL with `corepack pnpm db:up`.
4. Generate the Prisma client and apply local migrations with `corepack pnpm db:generate` and
   `corepack pnpm db:migrate`.
5. Start both applications with `corepack pnpm dev`, or start them separately with
   `corepack pnpm dev:web` and `corepack pnpm dev:api`.

The web app is available at `http://localhost:3000`; the API listens on port 4000, with its
OpenAPI UI at `http://localhost:4000/api/docs`.

To stop PostgreSQL, run `corepack pnpm db:down`. The local Compose volume is retained between stops.
The Compose database password is for local development only and must not be reused elsewhere.

## PostgreSQL integration tests

The API integration test requires a dedicated PostgreSQL database named
`portfolio_intelligence_hub_test`. Set `TEST_DATABASE_URL` to that database; the test refuses any
other database name and never falls back to `DATABASE_URL`. It is skipped when `TEST_DATABASE_URL`
is not set.

Create the dedicated database using your local PostgreSQL administration workflow:

```sql
CREATE DATABASE portfolio_intelligence_hub_test;
```

Then point Prisma migrations and the API test at it from PowerShell:

```powershell
$env:TEST_DATABASE_URL = 'postgresql://<user>:<password>@127.0.0.1:5432/portfolio_intelligence_hub_test'
$env:DATABASE_URL = $env:TEST_DATABASE_URL
corepack pnpm --filter @pih/api run db:deploy
corepack pnpm --filter @pih/api run test
```

Use a test-only database; do not point this URL at development or production data.

## Checks

Run `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build`,
and `corepack pnpm format:check`.
The API client is generated from the NestJS OpenAPI document during typecheck/build.
To regenerate both contract artifacts explicitly, run `corepack pnpm run api-client:generate`.
Commit the generated `apps/api/openapi.json` and
`packages/api-client/src/generated/schema.d.ts`; do not edit either file manually. CI regenerates
them during typecheck/build and fails if the generated files differ from the committed versions.
