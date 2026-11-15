---
applyTo: 'apps/api/src/**/*.ts'
---

- Organize backend capabilities as NestJS modules with explicit providers and clear ownership.
- Keep HTTP concerns in controllers and business behavior in providers/services.
- Use Prisma through the database module; schema changes require a committed migration.
- Expose API contracts through NestJS OpenAPI metadata; regenerate the frontend API client after
  contract changes.
- Validate external input and surface operational failures instead of hiding them.
