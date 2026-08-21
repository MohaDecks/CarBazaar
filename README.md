# Premium Car Marketplace

A full-stack vehicle marketplace optimized for Ethiopia (ETB currency).

## Structure

```
apps/
  web/      → Next.js marketplace
  admin/    → Next.js admin portal
  api/      → Express + MongoDB API
  mobile/   → Expo React Native app
packages/
  types/    → Shared TypeScript types
  utils/    → Shared utilities
  config/   → Design tokens & shared config
  ui/       → Shared UI primitives
```

## Prerequisites

- Node.js 20+
- MongoDB running locally (or set `MONGODB_URI`)

## Quick Start

```bash
# Install dependencies
npm install

# Build shared packages
npm run build -w @car-marketplace/types
npm run build -w @car-marketplace/utils

# Seed database
npm run db:seed

# Start API (port 4000)
npm run dev:api

# Start Web (port 3000)
npm run dev:web

# Start Admin (port 3001)
npm run dev:admin

# Start Mobile
npm run dev:mobile
```

## Demo Accounts

| Role   | Email                        | Password      |
|--------|------------------------------|---------------|
| Admin  | admin@carmarketplace.et      | Password123!  |
| Seller | seller@carmarketplace.et     | Password123!  |
| Buyer  | buyer@carmarketplace.et      | Password123!  |

## Design System

- **Primary:** Deep charcoal / black / white
- **Accent:** Premium emerald `#0D7A4F`
- **Fonts:** Syne (display) + DM Sans (body)
- **Currency:** ETB

## Image Rules

- One primary image per vehicle card
- Aspect-ratio containers with `object-fit: cover`
- Gallery: main image + controlled thumbnails
- Optional 3D viewer with graceful fallback
