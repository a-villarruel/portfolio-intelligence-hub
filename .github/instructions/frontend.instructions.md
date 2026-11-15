---
applyTo: 'apps/web/**/*.{ts,tsx}'
---

- Use Next.js App Router conventions and keep route files focused on composition.
- Put capability-specific UI and logic under `src/features`; place genuinely shared presentation
  components under `src/components`.
- Call backend APIs through `@pih/api-client`; do not import API or database implementation code.
- Prefer accessible semantic HTML and cover non-trivial UI behavior with tests.
