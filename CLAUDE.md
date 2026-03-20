# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
pnpm dev          # Start dev server (Next.js + Turbopack)
pnpm build        # Production build
pnpm lint         # ESLint
```

All root scripts proxy to the `web` workspace via `pnpm --filter web`.

### Supabase Local Development

```bash
supabase start    # Start local Supabase (API :54321, DB :54322, Studio :54323)
supabase stop     # Stop local Supabase
supabase db reset # Reset DB and re-run migrations + seed
```

Migrations live in `supabase/migrations/`. Seed data in `supabase/seed.sql`.

## Architecture

**Monorepo** (pnpm workspaces): `web` (Next.js 16 app) + `shared` (types, constants, utils).

**Path aliases:** `@/*` → `web/src/*`, `@shared/*` → `shared/*`

### Key Directories

- `web/src/app/(app)/` — Protected routes (dashboard, check-in, diet, challenges, social, profile)
- `web/src/app/(auth)/` — Public auth routes (login, signup, onboarding, password reset)
- `web/src/app/api/auth/line/` — Custom LINE OAuth flow (manual code exchange, not Supabase-managed)
- `web/src/lib/` — Server Actions (`*-actions.ts`) and Supabase client utilities
- `web/src/components/features/` — Feature-specific components
- `web/src/components/ui/` — Reusable UI primitives
- `shared/types/` — Shared TypeScript interfaces (User, CheckIn, Meal, Challenge, Battle, FeedItem)
- `shared/constants/` — Exercise types with MET values, nutrient constants
- `shared/utils/` — Calorie calculator, streak logic, invite code generator

### Data Flow Pattern

All data mutations use **Next.js Server Actions** (`"use server"` in `web/src/lib/*-actions.ts`). Pages are server components that fetch data; interactive parts use `*-client.tsx` client components.

### Supabase Client Usage

Three client factories — use the right one:
- `lib/supabase/client.ts` — Browser client (client components)
- `lib/supabase/server.ts` — Server client (Server Actions, server components)
- `lib/supabase/middleware.ts` — Middleware client (session refresh in `middleware.ts`)

All tables use Row-Level Security (RLS). For admin operations (e.g., LINE auth user creation), use `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS.

### Authentication

Three providers: **LINE** (custom OAuth via API route), **Google** (Supabase-managed), **Email/Password** (Supabase-managed). Middleware refreshes sessions on every request and enforces auth/onboarding redirects.

### Offline Support

Check-ins support offline queuing via IndexedDB (`idb-keyval`). See `lib/offline-queue.ts`.

## Design System

Tailwind CSS v4 with custom theme tokens in `web/src/app/globals.css`:
- Primary: orange (#F97316), Accent: green (#22C55E)
- Fonts: Nunito (headings), DM Sans (body)
- Mobile-first with `max-w-md` container constraint
- Dark mode supported via CSS variables
- Clay/neumorphic shadow style (`shadow-clay`)

## Language

UI is **Traditional Chinese** (繁體中文) only. All user-facing strings and error messages are in Chinese. No i18n library.

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase public
- `SUPABASE_SERVICE_ROLE_KEY` — Server-only admin key
- `NEXT_PUBLIC_SITE_URL` — Deployment URL for OAuth redirects
- `LINE_CHANNEL_ID`, `LINE_CHANNEL_SECRET` — LINE Login OAuth

## Deployment

Vercel (Hobby plan). Build config in `vercel.json`. Do not add `Co-Authored-By` to commits — Vercel Hobby blocks deploys with that trailer.
