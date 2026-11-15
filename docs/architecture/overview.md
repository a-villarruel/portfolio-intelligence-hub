# Architecture overview

The product starts as a modular monolith: one Next.js web application, one NestJS API, and one
PostgreSQL database. The API owns persistence and organizes capabilities into Nest modules.
Modules should expose explicit service/provider boundaries and avoid reaching into another
module's internals.

The frontend consumes the API through an OpenAPI-generated client in `packages/api-client`.
It must not import NestJS DTOs, Prisma models, or backend implementation code directly.

The initial modules are expected to cover IT demand, portfolio management, prioritization,
project tracking, risks and issues, analytics, and the portfolio assistant. Their boundaries
and data ownership will be refined as product workflows are approved. Hosting, authentication,
tenancy, and AI-provider decisions remain open.
