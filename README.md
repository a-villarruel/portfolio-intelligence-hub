# Portfolio Intelligence Hub

An AI-powered IT portfolio and project management platform. The initial architecture is a
TypeScript modular monolith with a Next.js web app, a NestJS API, and PostgreSQL.

## Repository

- `apps/web` — Next.js frontend.
- `apps/api` — NestJS backend and database migrations.
- `packages/api-client` — frontend client generated from the API's OpenAPI document.
- `docs` — architecture, decisions, product scope, and development guidance.

## Requirements

- Node.js 24 LTS (see `.node-version`).
- pnpm 12 (pinned in `package.json`).
- Docker Desktop or another Docker Compose-compatible runtime for local PostgreSQL.

## Getting started

See [the development guide](docs/development/getting-started.md) for installation, environment
configuration, and local commands.

## Engineering practices

Run `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm test`, `corepack pnpm build`,
and `corepack pnpm format:check` before
opening a pull request. Architecture decisions are recorded in [docs/decisions](docs/decisions).
