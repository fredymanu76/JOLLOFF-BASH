# Jollof Bash — Supper Club Booking App

## Identity
- **Project**: Jollof Bash
- **Repo**: fredymanu76/JOLLOFF-BASH
- **Type**: Next.js 15 + TypeScript + Firebase + Stripe PWA
- **Purpose**: Monthly supper club event booking (last Saturday of each month, 6:30pm)

## Tech Stack
- Next.js 15 (App Router, TypeScript)
- Tailwind CSS 4
- Firebase Auth (Email/Password), Firestore, Cloud Functions, FCM
- Stripe Checkout for payments
- Vercel hosting (free tier)

## Architecture
- Route groups: (public), (auth), (customer), (admin)
- Firebase Cloud Functions in `functions/` directory (separate tsconfig)
- All monetary values stored in **pence** (integer) to avoid floating-point issues
- PWA with service worker for installability

## Key Constants
- Seat price: £25 (2500 pence)
- Corkage fee: £2 (200 pence)
- Events: Last Saturday of each month, 6:30pm
- Admin email: fredymanu76@gmail.com

## Design Theme ("Jollof")
- Primary: Warm amber (#F59E0B)
- Accent: Deep red (#DC2626)
- Background: Warm dark (#1C1917)
- Surface: #292524
- Text: #FAFAF9

## Commands
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npx tsc --noEmit` — Type check
- `cd functions && npm run build` — Build Cloud Functions

## Rules
- NEVER commit .env files or Firebase service account keys
- Always run `npx tsc --noEmit` before pushing
- Use pence for all monetary calculations
- Keep Cloud Functions code in `functions/` with its own tsconfig
