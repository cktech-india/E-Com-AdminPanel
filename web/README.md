# Entity Microservices — Frontend (Angular)

Angular 18 app built on the **Fuse Admin Template**. It's a metadata-driven shell: layouts, grid columns, validations, and input components are rendered dynamically from entity/datapoint metadata fetched from the backend — not hand-coded per feature.

> For backend architecture, build commands, auth/tenancy, and naming anomalies, see the [Root README.md](../README.md). For Claude Code auto-loaded frontend conventions, see [CLAUDE.md](CLAUDE.md).

---

## Stack

- Angular 18.0.1, Angular Material 18, `@angular/cdk`, `@angular/material-luxon-adapter`.
- `@ngneat/transloco` (i18n), `apexcharts`/`ng-apexcharts` (charts), `@fullcalendar/*` (calendar), `exceljs` (client-side Excel parsing/generation), `file-saver`, `crypto-js`, rich text editors (`ngx-quill`, `ngx-editor`, `tinymce` wrapper), `ngx-toastr`.

## Commands

```bash
npm install       # install dependencies
npm run start     # dev server at http://localhost:4200/
npm run build     # production bundle -> /dist
npm run test      # unit tests (Karma)
```

---

## Folder structure (`src/app`)

- **`core/`** — `auth/` (`auth.service.ts`, `auth.interceptor.ts`, `auth.utils.ts`), `font-size/` (`font-size.service.ts`), `navigation/`, `icons/`, `transloco/`, `user/`, `util/`.
- **`layout/`** — Fuse template shell/nav components (`common/`, `layouts/`).
- **`modules/admin/`** — real feature modules: `calendar/`, `dashboard/`, `entity/`, `file-repository/`, `reports/`, `sessions/`, `users/` (`example/` is unused Fuse template boilerplate).
- **`modules/auth/`, `modules/landing/`, `modules/shared/`** — auth pages, landing, shared components.
- **`mock-api/`** — Fuse template's mock backend scaffolding; not used for real backend integration.
- Top-level services: [`data.service.ts`](src/app/data.service.ts) (dynamic API calls to `api/entity/data/...`), [`crud-operation.service.ts`](src/app/crud-operation.service.ts) (CRUD calls to `api/entity/record/...`), `ui.service.ts`. Routing in `app.routes.ts`.

### Entity module (`modules/admin/entity/`)

Feature dirs: `entity-action`, `entity-data-points-entry`, `entity-datapoint-list`, `entity-definition-entry`, `entity-definition-list`, `entity-etl-config(-list)`, `entity-etl-pre-process`, `entity-etl-upload`, `entity-form-entry`, `entity-form-list`, `entity-print-config`, `entity-scheduler`, `entity-validator-list`.

Shared `components/`: `change-history-dialog`, `confirm-dialog`, `document-view`, `entity-def-*-popup` (datapoint/group/property/scorecard editors), `entity-enrichment`, `entity-form-entry-component`, `entity-form-list-components`, `entity-validation`, and the dynamic field-widget family: `field`, `field-attachment`, `field-ck-text-editor`, `field-date-time-picker`, `field-datepicker`, `field-display`, `field-dropdown`, `field-input`, `field-quill-editor`, `field-switch`, `field-text-area`, `field-tinymce-editor`.

---

## Auth & tenant header

`auth.interceptor.ts` (functional `HttpInterceptorFn`) attaches `Authorization: Bearer <accessToken>` and `X-tenant: <tenantId>` (from `sessionStorage`, default `'default'`) to every request except `tenant-details`. On `401`/`403` it signs out and hard-reloads. **Calling the API directly (Postman/curl) without `X-tenant` will 400** — see root README's multi-tenancy section.

`AuthService` (`core/auth/auth.service.ts`):
- `signIn()` stores the login response's token/`currentUser` (which includes `userCompany`).
- `switchCompany(companyCode)` re-issues a JWT with the new company embedded via `POST /authenticate/switch-company`, and is what the post-login company switcher (`layout/layouts/horizontal/enterprise/enterprise.component.ts`) calls on change.
- Single-company users get their company auto-embedded in the JWT server-side at login (see root README's auth section) — no extra frontend call needed for that case.

---

## Custom framework gotchas

### Grid server-side sorting
Bind `(matSortChange)="onSortingClicked($event)"` directly on `<table mat-table [dataSource]="dataSource" matSort ...>`. Do **not** bind click handlers to header `<th>` tags — a native mouse click event lacks the Angular Material `Sort` event fields (`active`/`direction`).

### Form enrichments & events
Standard controls (dropdowns, toggles, date pickers) lack a native `.type` field. `FieldComponent.onChange()` normalizes these into a unified `{ type: 'change', originalEvent: $event }` shape before propagation. Contextual expressions (e.g. retailer formulas) are evaluated with `new Function()` in the context of currently-filled form field codes, not global `eval`.

### Server-side Excel/CSV upload/export
Frontend parses uploaded headers locally (`parseCsvLineClient` for CSV, `Exceljs` for spreadsheets) to show mapping selectors, then posts Base64 file content + mappings + `companyCode` to `POST /api/entity/record/upload/{entityCode}`. Export buttons on the list view produce full-column Excel/CSV; the upload drawer offers blank template downloads in both formats.

### Font-size service
[`FontSizeService`](src/app/core/font-size/font-size.service.ts) persists `'sm'|'md'|'lg'|'xl'` to `localStorage['entity-font-size']` and applies an `entity-font-size-{size}` class to `document.body`. CSS overrides in [`src/styles/styles.scss`](src/styles/styles.scss) are scoped only to `app-entity-form-entry-component` and `app-entity-form-list-components`.

### Dynamic entity form mapping
`entity-form-entry-component` parses `groupProperties` defensively — handles both stringified JSON and a pre-deserialized object:
```typescript
if (typeof g.groupProperties === 'string') {
    g.groupProperties = JSON.parse(g.groupProperties);
}
```
Datapoints are matched to groups via `Number(datapointGroupId) === Number(sequenceNo)` (avoids string/number mismatches); unassigned/mismatched datapoints fall back to the first group so they stay visible.

### Compressed header controls
Do not use Material `mat-icon-button` for extremely compressed header controls (e.g. `28px`/`w-7 h-7`) — MDC layout overrides clip buttons inside parents with `overflow-hidden`. Use a plain HTML `<button>` styled with Tailwind instead.

### Imports for standalone components
[`entity-form-entry-component`](src/app/modules/admin/entity/components/entity-form-entry-component/) is standalone — check that Material modules like `MatCardModule`/`MatTooltipModule` are listed in its `imports` array whenever used in the template.

---

For the entity/action/relation business data model, see [BUSINESS_LOGIC.md](BUSINESS_LOGIC.md).
