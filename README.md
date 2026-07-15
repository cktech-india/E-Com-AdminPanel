# Sinjay Mart - Admin Panel (Spring Boot & Angular 18)

This is the admin panel for the Sinjay Mart e-commerce platform. It provides the administration interface to manage products, categories, orders, customers, and system settings. The project contains a Spring Boot backend in the root folder and an Angular 18 frontend inside the `web` folder. 

Both the admin panel and the customer-facing website share the same MySQL database.

---

## 🛠 Project Tech Stack

### Backend
- **Framework:** Spring Boot 3.5.15 (Spring Web, Spring Data JPA)
- **Java Version:** JDK 17
- **Build Tool:** Gradle
- **Database Driver:** MySQL Connector/J
- **ORM / JPA:** Hibernate
- **Boilerplate Reduction:** Lombok

### Frontend
- **Framework:** Angular 18.0.1 (Angular Material 18, Angular CDK)
- **Theme/Starter:** Fuse Admin Template
- **Styling:** TailwindCSS 3.x, Custom SCSS
- **Key Libraries:** RxJS, ApexCharts (dashboard), ExcelJS (import/export), Quill/TinyMCE (rich-text editors), Transloco (i18n)

---

## 📂 Project Structure

```
E-Com-AdminPanel/
├── config/                     # Backend external configuration properties
├── gradle/                     # Gradle wrapper resources
├── src/
│   ├── main/
│   │   ├── java/com/cktech/ecom/
│   │   │   ├── common/         # Application enums and shared constants
│   │   │   ├── controller/     # REST controllers (Product, Order, Category, etc.)
│   │   │   ├── model/          # JPA entities (referred to as *DTO)
│   │   │   ├── repository/     # Data repositories extending GenericRepository
│   │   │   └── service/        # Business logic services
│   │   └── resources/          # Local properties (application.properties)
│   └── test/                   # JUnit integration and unit tests
└── web/                        # Angular frontend project (Fuse Template)
    ├── public/                 # Static assets and runtime JSON configs
    └── src/app/
        ├── core/               # Auth, Interceptors, Navigation services
        ├── layout/             # Shared structural layouts (Fuse navbar, headers)
        └── modules/admin/      # Admin pages (Dashboard, Users, Sessions, Reports)
```

---

## 🏛 Backend Architecture

The backend exposes a REST API for e-commerce entities. It uses a generic pattern to manage entities, auditing, and soft deletes.

### 1. Base Entity Model: `Auditable`
All entity models (e.g., `ProductDTO`, `CategoryDTO`) extend [Auditable](file:///Users/chempukutti/Documents/Projects/ECommerce/E-Com-AdminPanel/src/main/java/com/cktech/ecom/model/dto/Auditable.java).
This base class automatically adds:
- Audit columns: `created_by`, `created_date`, `last_modified_by`, `last_modified_date` (automatically populated by Spring Data Auditing).
- Soft Delete support: `isDeleted` flag (`Boolean` default `false`).
- Active status: `isActive` flag (`Boolean` default `true`).
- Transient fields: `recordMode` (AppEnum) and `currentUser` for context-aware operations.

### 2. Base Repository: `GenericRepository`
All JPA repositories (e.g., `ProductRepository`) extend [GenericRepository](file:///Users/chempukutti/Documents/Projects/ECommerce/E-Com-AdminPanel/src/main/java/com/cktech/ecom/repository/common/GenericRepository.java).
This interface overrides CRUD commands to respect the soft delete behavior:
- `findByIsDeletedFalse()`: Automatically excludes soft-deleted records.
- `findByIsDeletedFalseAndIsActiveTrue()`: Fetches only active, non-deleted records.
- `updateIsDeletedFlag(ID id, boolean isDeleted, String idFieldName)`: Performs a soft delete update.

---

## 🎨 Frontend Architecture (Angular 18)

The frontend is located in the [web/](file:///Users/chempukutti/Documents/Projects/ECommerce/E-Com-AdminPanel/web) directory and is styled using **TailwindCSS** and **Angular Material**.

### ⚠️ Current Frontend Status
> [!IMPORTANT]
> The Angular frontend is currently in an early template/starter state. The specialized pages for managing e-commerce data (like products, categories, orders) are **yet to be developed** using the Fuse layout. Developers must implement new modules under `web/src/app/modules/admin/` to expose CRUD options.

### Frontend API Communication
- All HTTP requests go through the [DataService](file:///Users/chempukutti/Documents/Projects/ECommerce/E-Com-AdminPanel/web/src/app/data.service.ts), which manages the base API URLs.
- The default local configuration is defined in [config.local.json](file:///Users/chempukutti/Documents/Projects/ECommerce/E-Com-AdminPanel/web/public/data/config.local.json):
  ```json
  {
      "apiUrl": "http://localhost:8082/api/",
      "authUrl": "http://localhost:8082/authenticate/"
  }
  ```
- **Http Interceptor (`auth.interceptor.ts`)**: Automatically attaches the following headers to every outgoing request:
  - `Authorization: Bearer <accessToken>` (from authentication context).
  - `X-tenant: <companyCode>` (for multi-tenant data isolation, defaults to `'default'`).

---

## 🗄 Shared Database Details

Both projects connect to the same database. Refer to the website's [schema.sql](file:///Users/chempukutti/Documents/Projects/ECommerce/E-com-website/schema.sql) for the table structures.

### Key Database Tables Shared:
- `products_t`: Product master record (maps to `ProductDTO`).
- `category_t`: Product category categories (maps to `CategoryDTO`).
- `orders_t` & `order_items_t`: Order metadata and line items.
- `users_t`: Customer profiles and administrators.
- `company_t`: Stores definitions for multi-tenant isolation.
- `billing_t` & `billing_details_t`: Invoices.

### Multi-Tenancy & Isolation
All shared tables contain a `company_code` column.
- **Backend Enforces Isolation:** The backend uses the `X-tenant` header to set the company context, ensuring that operations on `Product`, `Category`, etc., scope the SQL query with the company code.

---

## 🚀 Execution & Running Locally

### Prerequisites
- JDK 17
- Node.js (v18+ recommended)
- MySQL Server (running database `ecommerce_dev`)

### Step 1: Start the Spring Boot Backend
Configure your database properties in [application.properties](file:///Users/chempukutti/Documents/Projects/ECommerce/E-Com-AdminPanel/src/main/resources/application.properties):
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce_dev
spring.datasource.username=<db-user>
spring.datasource.password=<db-password>
```
Start the application from the root directory:
```bash
./gradlew bootRun
```
*The backend server starts on port `8080` (or `8082` if customized via flags).*

### Step 2: Start the Angular Frontend
Navigate to the `web` directory:
```bash
cd web
npm install
npm run start
```
*The dev server will run on [http://localhost:4200/](http://localhost:4200/).*

---

## 💡 Tips for AI Agents & Developers

1. **Creating New UI Screens:**
   - Create a standalone Angular component in `web/src/app/modules/admin/`.
   - Add routes in `web/src/app/app.routes.ts` or the sub-module routes file.
   - Use standard Angular Material components + Tailwind utilities for grid structures and styles.
   - Inject the HTTP client or create an Angular service calling `this.httpClient.post` with the corresponding endpoint (e.g. `api/products`).
2. **Adding Entity Fields:**
   - Add the database column in the table definition.
   - Update the Java entity DTO (e.g. `ProductDTO.java`) with the field and `@Column` mapping.
   - Since `spring.jpa.hibernate.ddl-auto` is set to `update`, Hibernate will automatically add the column to the physical table on start.
