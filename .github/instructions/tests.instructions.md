---
applyTo: '**/*.{test,spec}.{ts,tsx}'
---

- Test observable behavior and meaningful edge cases rather than implementation details.
- Keep unit tests independent of external services; use explicit integration tests when a real
  PostgreSQL connection is required.
- Make tests deterministic and clean up resources they create.
