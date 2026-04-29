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

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Artifacts

- **`artifacts/api-server`** — Express API stub at `/api`.
- **`artifacts/mockup-sandbox`** — design canvas.
- **`artifacts/pharma-track`** (path `/`) — **Predictive Pharmaceutical Tracking & Provenance System**. React + Vite + Tailwind v4 + shadcn/ui dark "mission-control" dashboard. Frontend-only (no backend). Six pages: Overview, Add Batch (Manufacturer), Track (timeline), Verify (counterfeit detection), AI Insights (recharts forecasts), Smart Routing (SVG map). All blockchain logic runs client-side via Web Crypto SubtleCrypto SHA-256 (`src/lib/blockchain.ts`). State + seed data in `src/lib/store.ts`, persisted to `localStorage` under key `pharma-track-state-v1`. Seeded with 8 batches; counterfeit demo ID is `CTRF-9981`; Paracetamol +52% forecast surge is hardcoded for demo.
