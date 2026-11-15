# Repository guidance

- Use the pinned Node.js and pnpm versions; prefer root scripts documented in `README.md`.
- Keep strict TypeScript settings enabled. Avoid `any`, unsafe casts, and silent error handling.
- Preserve the modular-monolith boundary: API domain modules own their behavior; do not import
  another module's internal implementation.
- Keep the frontend independent of NestJS DTOs and Prisma models. Consume generated API contracts
  from `packages/api-client`.
- Keep database schema changes in Prisma migrations under `apps/api/prisma/migrations`.
- Add or update tests for behavior changes. Run lint, typecheck, tests, and build for relevant
  workspaces before proposing changes.
- Never commit credentials or local `.env` files.
- Record significant architecture changes as ADRs in `docs/decisions`.
