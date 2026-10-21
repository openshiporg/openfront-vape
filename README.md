# Openfront Vape

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fopenshiporg%2Fopenfront-vape&env=DATABASE_URL%2CSESSION_SECRET%2CS3_BUCKET_NAME%2CS3_REGION%2CS3_ACCESS_KEY_ID%2CS3_SECRET_ACCESS_KEY)

Openfront Vape is a self-hostable commerce application with catalog, inventory, customer accounts, orders, and regulated-product controls. Operators can maintain merchant authority, product classifications, policy records, and compliance reporting alongside the retail dashboard. Regulated transactions are disabled by the current release gate.

## Demo

Explore the application locally using the setup instructions below.

| | |
|---|---|
| **Public application** | `/[countryCode]` on your development URL |
| **Dashboard** | `/dashboard` on your development URL |

[Learn more →](https://github.com/openshiporg/openfront-vape)

[Documentation →](features/keystone/models)

## The Openfront Ecosystem

Openfront is part of an ecosystem of open-source commerce tools:

- **[Openfront E-commerce](https://github.com/openshiporg/openfront)**: Headless e-commerce for retail.
- **[Openfront Restaurant](https://github.com/openshiporg/openfront-restaurant)**: Restaurant ordering, point of sale, and kitchen operations.
- **[Openship](https://github.com/openshiporg/openship)**: Order routing for multi-channel fulfillment.
- **Openfront Vape**: (This repository) a self-hostable commerce application with catalog, inventory, customer accounts, orders, and regulated-product controls.

## Core Features

### Admin Dashboard
Manage gift cards, regions, currencies, products, product categories, price lists, invoices, discounts, api keys, shipping, compliance, shipping providers through dedicated dashboard workspaces and permission-controlled data screens.

### Storefront
Country-scoped routes provide product and collection browsing, carts, accounts, and checkout screens. Their presence does not authorize regulated checkout: transaction completion remains subject to the compliance gate.

### Retail Catalog & Operations
Manage products, variants, categories, collections, regional pricing, inventory, order records, invoices, discounts, and customer accounts.

### Regulated Product Controls
Record jurisdictions, merchant licenses, product authorizations, classifications, provider approvals, rule sets, age-verification attempts, and compliance decisions.

### Compliance Reporting
Inspect readiness, generate compliance reports, export inventory, and stop regulated commerce. Recorded approvals do not activate an approved identity, tax, payment, carrier, or registry provider stack.

## Architecture

### Technology Stack
- **Frontend**: Next.js 16 with App Router and React 19.
- **Backend**: KeystoneJS 6 with a GraphQL API.
- **Database**: PostgreSQL with Prisma ORM.
- **Styling**: Tailwind CSS 4 and shared shadcn/ui components.
- **Authentication**: Password-based user accounts and session-based access with role capabilities.

### Application Structure
```text
openfront-vape/
├── app/                    # Public pages, dashboard routes, and HTTP endpoints
├── features/
│   ├── keystone/           # Backend models, access rules, and GraphQL workflows
│   ├── platform/           # Operator workspaces and onboarding
│   ├── storefront/         # Public application components and screens
│   └── dashboard/          # Authentication and shared dashboard shell
└── components/             # Shared UI components
```

### Data Models
The [model registry](features/keystone/models/index.ts) and [Prisma schema](schema.prisma) cover:

- Products, variants, prices, regions, currencies, customers, carts, and orders.
- Payments, invoices, fulfillment, returns, shipping records, and inventory movements.
- Jurisdictions, merchant profiles, licenses, product authorizations, and classifications.
- Rule sets, provider approvals, age-verification attempts, compliance decisions, events, and reports.

## Getting Started

### Prerequisites
- Node.js 22, compatible with the [package requirements](package.json) and Next.js 16.
- A PostgreSQL database you can migrate.
- npm.

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone https://github.com/openshiporg/openfront-vape.git
   cd openfront-vape
   npm install
   ```

2. **Configure environment variables:**
   ```bash
   cp .env.example .env
   ```

   Review the [example configuration](.env.example) and replace its placeholders. Keep only the local settings you need; do not copy production-mode or infrastructure examples unchanged.

   ```env
   DATABASE_URL=postgresql://user:password@host/database
   SESSION_SECRET=replace-with-a-new-private-random-secret
   ```

   Generate the session secret with `openssl rand -hex 32`; use the generated value, not the placeholder. Never commit `.env`.

   Review [runtime configuration](features/keystone/index.ts) for additional application settings before building or deploying. Configure enabled integrations separately; the two values above are not a complete production configuration.

   Production also requires configured object storage. Set `S3_BUCKET_NAME`, `S3_REGION`, `S3_ACCESS_KEY_ID`, and `S3_SECRET_ACCESS_KEY`, and supply the S3-compatible endpoint described in the source. Review mail and application-specific security settings there as well.

3. **Start development server:**
   ```bash
   npm run dev
   ```

   The development script prepares the backend schema, applies checked-in migrations, and starts Next.js.

4. **Access the application:**
   Open the URL `npm run dev` prints, then use these paths:

   - **Public application**: `/[countryCode]`
   - **Admin dashboard**: `/dashboard`
   - **GraphQL API**: `/api/graphql`

5. **Create your first admin user:**
   Visit `/dashboard/init` on an empty database to create the initial administrator, then sign in to the dashboard.

6. **Run application onboarding:**
   Use dashboard onboarding and store settings to configure the retail catalog and regions. Establish merchant and product authority separately; onboarding does not enable regulated transactions.

## Development Commands

- `npm run dev` - Prepare the backend schema, apply migrations, and start Next.js development.
- `npm run build` - Build the backend and Next.js for production; does not apply migrations.
- `npm start` - Start the production Next.js server.
- `npm run migrate:gen` - Prepare the schema and generate/apply development migrations.
- `npm run migrate` - Apply checked-in Prisma migrations.
- `npm run lint` - Run the repository's ESLint script.
- `npm run typecheck` - Run the configured TypeScript check.

Use a disposable development database for migration generation. Review the script before running it against any existing data.

### Regulated Commerce Integration
Read the [readiness query](features/keystone/queries/regulatedCommerceReadiness.ts) and [regulated-commerce implementation](features/regulated-commerce) before connecting providers. The existing [payment loader](features/integrations/payment/index.ts) is not an approved regulated-provider stack and does not remove the transaction gate.

## Documentation

The [backend models](features/keystone/models), [registered business workflows](features/keystone/mutations/index.ts), [access rules](features/keystone/access.ts), and [application routes](app) document the implementation in this repository.

## Security & Permissions

### Role-Based Access Control
- `canAccessDashboard` - Access dashboard.
- `canManageProducts` - Manage products.
- `canManageOrders` - Manage orders.
- `canManagePayments` - Manage payments.
- `canReadCompliance` - Read compliance.
- `canManageCompliance` - Manage compliance.
- `canOperateComplianceKillSwitch` - Operate compliance kill switch.

### Security Features
- Session-based authentication for signed-in users.
- Backend list access and workflow authorization, rather than dashboard visibility alone.
- Administrative capabilities are explicit role flags. API-key and OAuth access requires both credential scopes and the owner's current permission; customer tokens never confer administrative role authority.

Review the [access implementation](features/keystone/access.ts) and individual workflow checks before extending permissions.

## Platform Components

### Admin Platform (`/dashboard`)
- **Gift Cards**: `/dashboard/platform/gift-cards`.
- **Regions**: `/dashboard/platform/regions`.
- **Currencies**: `/dashboard/platform/currencies`.
- **Products**: `/dashboard/platform/products`.
- **Product Categories**: `/dashboard/platform/product-categories`.
- **Price Lists**: `/dashboard/platform/price-lists`.
- **Invoices**: `/dashboard/platform/invoices`.
- **Discounts**: `/dashboard/platform/discounts`.
- **Api Keys**: `/dashboard/platform/api-keys`.
- **Shipping**: `/dashboard/platform/shipping`.
- **Compliance**: `/dashboard/platform/compliance`.
- **Shipping Providers**: `/dashboard/platform/shipping-providers`.

### Storefront Experience
Country-scoped routes provide product and collection browsing, carts, accounts, and checkout screens. Their presence does not authorize regulated checkout: transaction completion remains subject to the compliance gate.

Manage products, variants, categories, collections, regional pricing, inventory, order records, invoices, discounts, and customer accounts.

## Deployment

### Production Deployment
The Vercel button imports this application's own repository. Provision PostgreSQL and configure the application's complete runtime requirements, storage, mail, and enabled providers before building. Importing the source does not configure these services or grant regulatory approval.

Build the application and apply checked-in migrations as a release step before starting the server. Back up existing data before migration.

```bash
npm run build
npm run migrate
npm start
```

The included [Railway configuration](railway.toml) defines this app's build and startup lifecycle. Provision services and secrets separately.

### Scaling Considerations
Keep the shared PostgreSQL database, session secrets, and configured object storage consistent across application processes. Review background delivery and integration requirements before choosing a serverless runtime; a source import does not supply persistent workers.

## Contributing

Use the development commands above when preparing changes. Keep model changes and their migrations together, and describe workflow and permission changes in pull requests.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

## Support

- **Documentation**: [Source models and workflows](features/keystone/models).
- **Issues**: [Report bugs and feature requests](https://github.com/openshiporg/openfront-vape/issues).
- **Product**: [Learn more about Openfront Vape](https://github.com/openshiporg/openfront-vape).

---

Built with [Next.js](https://nextjs.org) and [KeystoneJS](https://keystonejs.com).
