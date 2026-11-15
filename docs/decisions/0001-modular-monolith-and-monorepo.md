# ADR 0001: Modular monolith and TypeScript workspace

- **Status:** Accepted
- **Date:** 2026-11-14

## Context

The product needs a full-stack TypeScript codebase with clear domain boundaries, local
development support, and a low-complexity path to adding capabilities.

## Decision

Use a pnpm workspace containing a Next.js frontend, a NestJS API, and focused shared packages.
Deploy the backend as a modular monolith initially. The API owns PostgreSQL persistence and
Prisma migrations. Publish API contracts to the frontend through generated OpenAPI types/client
code rather than cross-importing backend classes.

## Alternatives considered

- Separate repositories: rejected for the initial product because it adds coordination overhead.
- A task orchestrator: deferred until workspace scale warrants it.
- Shared Nest DTOs: rejected because it couples the frontend to backend implementation details.
- Independently deployed services: deferred until domain ownership and operational needs justify it.

## Consequences

- One lockfile and consistent TypeScript/tooling across the repository.
- Domain boundaries must be maintained through module design and review.
- API changes require regenerating and validating the frontend contract package.
- The initial deployment unit is intentionally not independently scalable by domain.
