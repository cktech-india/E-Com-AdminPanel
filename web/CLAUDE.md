# Frontend CLAUDE.md (Angular)

Full frontend architecture, folder structure, auth/tenant handling, and gotchas now live in [web/README.md](README.md) — read that first. This file stays short on purpose: Claude Code auto-loads it into every session under `/web`, so only the commands and hard rules that must always be in context live here.

> For backend commands and global code style rules (including package naming anomalies), see the [Root README.md](../README.md) and [Root CLAUDE.md](../CLAUDE.md).

## Build and run commands (run in `/web`)

```bash
npm install       # install dependencies
npm run start     # dev server at http://localhost:4200/
npm run build     # production bundle -> /dist
npm run test      # unit tests (Karma)
```

## Style rules

- **TailwindCSS**: utility classes for margins, padding, layout flex/grid, responsiveness. Avoid inline CSS.
- **Custom styling**: isolated component `.scss` files, or the global stylesheet in [src/styles/](src/styles/).
- **Forms**: Reactive Forms for complex validation layouts; match standard Angular Material patterns.
- **Standalone components**: check that Material modules used in a template (e.g. `MatCardModule`, `MatTooltipModule`) are actually listed in that component's `imports` array.

See [web/README.md](README.md) for everything else: folder structure, auth/tenant header requirements, grid sorting, form enrichment/event normalization, Excel/CSV upload-export, font-size service, and dynamic entity form mapping.
