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

## Checks

Run `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build`,
and `corepack pnpm format:check`.
The API client is generated from the NestJS OpenAPI document during typecheck/build.
