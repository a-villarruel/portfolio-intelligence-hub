# ADR 0002: Initial technology stack

- **Status:** Accepted
- **Date:** 2026-11-14

## Context

Portfolio Intelligence Hub needs a professional full-stack foundation for IT demand,
portfolio, prioritization, project, risk, reporting, and assistant capabilities. The initial
repository should be maintainable and locally runnable without committing to a hosting provider
or introducing infrastructure beyond current needs.

## Decision drivers

- Use TypeScript across the frontend and backend to share language and tooling.
- Keep clear domain boundaries while avoiding premature service decomposition.
- Provide typed API integration without coupling the frontend to backend implementation details.
- Support reliable local development and database schema evolution.
- Favor established tooling and defer infrastructure decisions that depend on deployment needs.

## Decision

- **Architecture:** Modular Monolith.
- **Frontend:** Next.js and React with TypeScript.
- **Backend:** NestJS with TypeScript.
- **Database:** PostgreSQL.
- **ORM and migrations:** Prisma.
- **API contract:** OpenAPI, with a generated TypeScript client consumed by the frontend.
- **Workspace:** pnpm monorepo containing the web app, API, and focused shared packages.
- **Initial execution environment:** Local development.
- **Hosting/cloud provider:** Deferred until deployment requirements are understood.

The API owns persistence and exposes its contract through OpenAPI. The frontend consumes the
generated client rather than importing NestJS DTOs or Prisma models.

## Alternatives considered

- **Separate services:** Deferred; independent deployments and operations add complexity before
  domain ownership or scaling needs are known.
- **Separate repositories:** Not selected for the initial full-stack product because coordinated
  API/client changes are easier to maintain in one workspace.
- **Cross-imported backend DTOs:** Not selected because that would couple frontend code to
  NestJS implementation details; generated OpenAPI contracts provide an explicit boundary.
- **Other UI/API frameworks, database layers, and package managers:** Not selected for the
  agreed foundation; reconsider only if product requirements or operational evidence justify it.
- **Cloud hosting now:** Deferred because provider selection is not required for local development.

## Consequences

- One TypeScript workspace and lockfile coordinate application and shared-package changes.
- The API is one deployment unit, while backend modules remain separated by domain responsibility.
- Prisma schemas and migrations are owned by the API.
- API contract changes require regenerating and validating the client package.
- Local development can proceed without cloud accounts or provider-specific infrastructure.
- The selected frameworks, ORM, and generated-client workflow establish conventions that future
  contributors must follow.

## Future considerations

Revisit hosting and deployment when operational requirements are known. Review authentication,
authorization, tenancy, AI provider/data handling, and production database operations before
implementing dependent features. Consider service decomposition only when domain boundaries,
team ownership, or measured runtime needs make it worthwhile.
