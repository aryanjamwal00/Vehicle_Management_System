# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite, React Query, React Hook Form, Recharts, Framer Motion

## Applications

### Vehicle Management System (`artifacts/vehicle-management`)

A full-featured Vehicle Management System web app. 

Features:
- **Dashboard**: Summary stats for customers, vehicles, and vehicle types
- **Customer Registration**: Register, view, edit, delete customers (name, email, phone, address, license number)
- **Vehicle Types**: Manage categories (Sedan, SUV, Truck, Motorcycle, etc.)
- **Vehicle Registration**: Register vehicles linked to customers and types (make, model, year, color, fuel type, status)
- **Vehicle Details**: Full vehicle detail view with owner and type information

## Structure

```text
artifacts-monorepo/
├── artifacts/              # Deployable applications
│   ├── api-server/         # Express API server
│   └── vehicle-management/ # React + Vite frontend (previewPath: /)
├── lib/                    # Shared libraries
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/                # Utility scripts
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

- **Always typecheck from the root** — run `pnpm run typecheck`
- **`emitDeclarationOnly`** — only `.d.ts` files during typecheck
- **Project references** — when package A depends on package B, A's `tsconfig.json` must list B in `references`

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages that define it
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Database Schema

- `customers` — customer registration (name, email, phone, address, license number)
- `vehicle_types` — vehicle categories (name, description, category)
- `vehicles` — vehicle records (reg number, make, model, year, color, fuel type, status, linked to customer + type)

## API Routes

- `GET/POST /api/customers` — list / create customers
- `GET/PUT/DELETE /api/customers/:id` — read / update / delete customer
- `GET/POST /api/vehicle-types` — list / create vehicle types
- `PUT/DELETE /api/vehicle-types/:id` — update / delete vehicle type
- `GET/POST /api/vehicles` — list / create vehicles
- `GET/PUT/DELETE /api/vehicles/:id` — read / update / delete vehicle

## Run codegen

```bash
pnpm --filter @workspace/api-spec run codegen
```
