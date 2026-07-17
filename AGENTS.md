# Project Structure: Sinjay Mart — Admin Panel

Technical reference for the Sinjay Mart admin panel: a **Spring Boot 3 backend** (repo root) + an **Angular 18 frontend** (`web/`), built on the Fuse Admin Template. Both share the same MySQL database as the sibling `../website` project (customer-facing site), isolated by `company_code`.

Read this first for orientation, then follow the links below for depth.

## 📚 Doc Map
- **This file** — cross-cutting map of the whole repo (backend + frontend), what's real vs. stale, security notes.
- [README.md](README.md) — original setup doc: stack list, folder structure, backend architecture (`Auditable`/`GenericRepository`), run instructions. **Contains one outdated claim — see below.**
- [web/CLAUDE.md](web/CLAUDE.md) — short, auto-loaded frontend commands + 4 style rules.
- [web/README.md](web/README.md) — frontend folder structure, auth/tenant header behavior, framework gotchas (grid sorting, form event normalization, Excel/CSV upload, dynamic entity forms). **Describes the metadata/entity-engine shell, not the e-commerce admin pages — see "Two API layers" below.**
- [web/BUSINESS_LOGIC.md](web/BUSINESS_LOGIC.md) — describes a metadata-driven "entity engine" (`ety_entity_t`, `EntityService.java`, `DynamicJobService.java`, dynamic DDL/ETL/scheduler). **These backend classes do not exist in this repo** — this doc describes a different/shared backend service the frontend was forked from. Don't search this repo's `src/main/java` for them.
- `web/CLAUDE.md` and `README.md` both reference a root `CLAUDE.md` for backend commands/code-style — **it does not currently exist.**
- The sibling `../website` project (PHP) is the customer-facing storefront sharing this DB — see `../website/AGENTS.md`.

## ⚠️ Security — read before touching config or auth code
- `config/application.properties`, `config/application.properties.bak`, and `src/main/resources/application.properties` all contain **plaintext DB credentials committed to git**, including one pointing at a live remote host. Never print, log, or copy these values. If adding config, prefer environment variables or an untracked override file — don't add more hardcoded credentials.
- `web/src/app/core/auth/auth.service.ts` has a **hardcoded `demo`/`demo` login backdoor** that bypasses real authentication with a mock JWT constant. This must never ship to production. Flag any request to extend or rely on this path.
- Per this org's policy, **any change to authentication, authorization, or credential handling requires a second-engineer review before deployment** (exemption: Adi or Eurico). Say so explicitly when finishing such a change.
- CORS (`common/WebConfig.java`) currently allows all origins (`"*"`) — be deliberate if changing this, it's a live security boundary.

## 🛠 Tech Stack
**Backend:** Java 17, Spring Boot 3.5.15, Gradle, Spring Data JPA + Hibernate (`ddl-auto=update`), MySQL Connector/J, Lombok, optional AWS S3 file storage (`store.type=LOC|S3`). Test: JUnit 5 (one smoke test exists). No linter/formatter configured.

**Frontend:** Angular 18.0.1 + Angular Material/CDK, Fuse Admin Template (ThemeForest starter — `web/package.json` name is still `fuse-angular`), TailwindCSS 3.4.3, RxJS, Transloco (i18n), ApexCharts, ExcelJS, Quill/ngx-editor, FullCalendar. Test: Karma/Jasmine. No ESLint configured (despite leftover `eslint-disable` comments in the template).

## 🚀 Running Locally
```bash
# Backend (repo root)
./gradlew bootRun        # http://localhost:8080 (see application.properties — NOT 8082 despite older docs)
./gradlew build          # build jar
./gradlew test           # JUnit 5

# Frontend (web/)
npm install
npm run start            # http://localhost:4200
npm run build            # -> web/dist/fuse
npm run test             # Karma/Jasmine
```
No `.env` files exist. Frontend API base URLs come from a static JSON file, not build-time env vars — see below.

## 📁 Backend Layout (`src/main/java/com/cktech/ecom/`)
Layer-based, not feature-based:
- `controller/` — 26 REST controllers, one per entity, flat under `/api` (e.g. `ProductController`, `OrdersController`, `BillingController`, `CompanyController`, `FileController` for S3/local uploads).
- `model/` — JPA entities, per-domain subpackages (`product/`, `order*/`, `tax/`, `user/`, `category/`, `company/`, `branch/`, `billing*/`, `faq/`, `inventory/`, `stocklog/`, `dto/`). **Entities are named `*DTO` (e.g. `ProductDTO`) even though they're `@Entity` classes, not transport DTOs** — a known naming anomaly, not a bug to "fix" without asking.
- `repository/` — Spring Data JPA, one per entity, all extending `repository/common/GenericRepository.java`.
- `service/` — one per entity, injected into controllers.
- All entities extend `model/dto/Auditable.java`: audit columns (`created_by`/`created_date`/`last_modified_by`/`last_modified_date`), soft-delete `isDeleted`, `isActive` flag, transient `recordMode`/`currentUser`.
- `GenericRepository` gives soft-delete-aware finders: `findByIsDeletedFalse()`, `findByIsDeletedFalseAndIsActiveTrue()`, `updateIsDeletedFlag(...)`.
- Adding a field: add the DB column → add it to the entity `*DTO` with `@Column` → Hibernate auto-adds the column on next boot (`ddl-auto=update`).

## 📁 Frontend Layout (`web/src/app/`)
Feature-folder-based, standalone components throughout (no NgModules for features):
- `data.service.ts` — bootstraps API base URLs (see below) + misc utility calls.
- `crud-operation.service.ts` (`CrudService`) — generic dropdown/master/data-result calls for the metadata engine.
- `core/auth/` — `auth.service.ts`, `auth.interceptor.ts`, guards (`AuthGuard`, `NoAuthGuard`).
- `core/navigation/`, `core/font-size/` (persists sm/md/lg/xl to `localStorage`), `core/transloco/`, `core/user/`.
- `layout/` — Fuse shell (nav, headers, company switcher under `layouts/horizontal/enterprise/`).
- `modules/admin/` — real feature pages, one folder per entity (see routes below), **plus** `modules/admin/entity/` — the metadata/no-code engine UI (`entity-definition-entry`, `entity-form-entry`, `entity-etl-*`, `entity-scheduler`, dynamic `field-*` widgets). The `entity/` subtree exists in source but is **not currently wired into `app.routes.ts`** — dormant, not deleted.
- `modules/auth/`, `modules/landing/home/`, `modules/shared/` (`api-services/entity.api.service.ts`, shared modals).
- `mock-api/` — Fuse template's mock backend scaffolding. **Not used** for real integration — ignore it.
- `@fuse/` — vendored template component/utility library. Treat as third-party, not app code.

### Routes (`web/src/app/app.routes.ts`)
> **Correction to `README.md`:** its "Current Frontend Status" section claims e-commerce admin pages are "yet to be developed." That's stale — the real pages already exist and are routed:

`products`, `categories`, `orders`, `billing`, `inventory`, `discounts`, `faqs`, `contact-inquiries`, `branches`, `companies`, `tax-config`, `product-media`, `product-group`, `product-recommended`, `product-reviews`, `home-config`, `stock-logs`, `carts`, `wishlists` — all lazy-loaded under the authenticated admin layout. Plus `dashboard`, `reports`, `user` (nested: `staff`, `customer`, `role-list`, `screens`), `file-repository`, `sessions`. Auth routes (`sign-in`, `sign-up`, `forgot-password`, etc.) live under `modules/auth/`.

## 🔀 Two Parallel API Layers — know which one you're touching
1. **Direct e-commerce REST** — `modules/admin/ecommerce.service.ts` calls this repo's own Spring Boot controllers directly (`{apiUrl}products`, `{apiUrl}categories/active-list`, etc.), appending `companyCode` from `AuthService.selectedCompany`. This maps 1:1 to the 26 controllers under `src/main/java/.../controller/`. **This is the layer you're almost always working in for e-commerce features.**
2. **Metadata/entity-engine calls** — `modules/shared/api-services/entity.api.service.ts` and `crud-operation.service.ts` hit generic endpoints (`entity/entity-definition/{entityCode}`, `entity/record/save/{entityCode}`, `master/entity`, `data/dropdown/{id}`, `entity/access/user-group-privilege/{groupCode}`). **No controller for these exists in this repo.** They're served by a separate backend this frontend was forked from (see `web/BUSINESS_LOGIC.md` note above). Don't try to implement these endpoints here unless explicitly asked to stand up that engine — flag the gap instead.

## 🌐 Environment / Base URL Configuration
No Angular environment files, no process env vars for API URLs. `data.service.ts` fetches a static JSON at startup:
- `web/public/data/config.local.json` when the URL includes `localhost` (currently `apiUrl: http://localhost:8080/api/`, `authUrl: http://localhost:8080/authenticate/`, plus a second `apiUrl1`/`authUrl1` pair pointing at an external `crm.nactechsolution.com` host — consistent with the entity-engine living elsewhere).
- `web/public/data/config.json` otherwise (production values — check this file directly when working on deployment, don't assume).
Values are copied into `sessionStorage` at boot. To point the app at a different backend, edit these JSON files, not build config.

## 🔐 Auth & Multi-Tenancy Reality
- Frontend expects **JWT bearer auth**: `AuthService.signIn()` POSTs to `{authUrl}login`, stores the token in `sessionStorage` (or `localStorage` if "remember me"). `auth.interceptor.ts` attaches `Authorization: Bearer <token>` and `X-tenant: <companyCode>` (default `'default'`) to every request except `tenant-details`; 401/403 triggers sign-out + reload.
- **This repo's Spring Boot app has no authentication/JWT controller at all.** The `/authenticate/login`, `/authenticate/switch-company`, `/authenticate/tenant-details` endpoints the frontend calls are served by a different backend (same one behind the entity engine, per above) — don't look for them in `src/main/java`.
- `UserController` does plain SHA-256 password hashing for `passwordHash` on save — that's the extent of auth-adjacent logic actually in this repo.
- Multi-tenancy: `X-tenant` header carries `companyCode`; `AuthService.switchCompany()` reissues a JWT with the new company embedded, used by the layout's company switcher.

## 🎨 Frontend Conventions
- TailwindCSS-first; avoid inline CSS. Component-scoped `.scss` for anything Tailwind can't express, global styles in `web/src/styles/`.
- Reactive Forms for non-trivial validation.
- **Standalone components:** always check that Material modules used in a template (`MatCardModule`, `MatTooltipModule`, etc.) are actually listed in that component's `imports` array — a recurring gotcha in this codebase.
- Path alias: `@services/* → app/*` (see `web/tsconfig.json`).
- See [web/README.md](web/README.md) for grid sorting quirks, form-event normalization, Excel/CSV upload flow, and dynamic entity-form mapping details — not duplicated here.

## 🚀 Adding a New Admin Screen
1. Create a standalone component under `web/src/app/modules/admin/<feature>/`.
2. Add a lazy route in `app.routes.ts` (or the feature's own `*.routes.ts` if nested, e.g. `users.routes.ts`).
3. Add/extend an Angular service calling the matching `/api/<entity>` endpoint (follow `ecommerce.service.ts`'s pattern) — append `companyCode` where the backend expects tenant scoping.
4. On the backend: entity (`model/<domain>/XxxDTO.java` extending `Auditable`) → repository (extending `GenericRepository`) → service → controller under `/api/xxx`. Add the DB column and let `ddl-auto=update` handle the migration in dev.
5. Use Material + Tailwind for layout, Reactive Forms for input.

## 📊 Adding or Configuring Dynamic Dashboards & Reports
The dashboard system is fully configuration-driven and does not require writing Java code or modifying database tables to create new dashboards or report widgets:
1. **JSON Definition**: Define the report and its widgets in a JSON file placed at `config/assets/reports/{REPORT_CODE}.json`. It specifies widgets, types (CHART, GRID, SCORECARD, etc.), width, and column formats.
2. **SQL Query Definition**: Write the SQL queries used by the widgets in `config/assets/queries.xml`. Use named parameters (e.g. `:userId`, `:startDate`) to filter dynamically based on widget inputs.
3. **API Access**: The frontend retrieves the dashboard layout via `GET /api/report/id/{REPORT_CODE}` and fetches widget data via `POST /api/report/widget-data`.

