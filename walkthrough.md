# Security Summary

This application was hardened across both the Express backend (`server.ts`) and React storefront/admin client (`src/context/StoreContext.tsx`, `src/utils/adminAuth.ts`, `src/components/auth/AdminLoginModal.tsx`, `src/components/customer/CustomerDashboardModal.tsx`, and `src/components/admin/SocialAutoScheduler.tsx`) to eliminate unauthenticated administrative access, remove client-side credential/token leaks, enforce manual verification for MFS wallet top-ups, and prevent cross-customer data exposure:

- **Server-Side Admin Session Tokens & Login Guard**: Removed all hardcoded admin credentials and fixed client-side session headers. Admin authentication now issues signed HMAC-SHA256 in-memory Bearer tokens via `/api/admin/auth/login` or `/api/admin/auth/firebase-session` (with a First-Run Admin Setup claim flow at `/api/admin/auth/claim` when unconfigured, or `ADMIN_PASSCODE` environment validation). Tokens live strictly in memory (`src/utils/adminAuth.ts`) and are never written to `localStorage` or `sessionStorage`.
- **Route-Level Authorization Enforcement**: Applied server-side `requireAdminAuth` checks across all administrative, database/Hostinger, courier (Steadfast), WhatsApp/SMTP messaging, n8n export, bulk SMS, backup/restore, autopilot/AI team, and order modification/deletion routes. Public `GET /api/store/sync` and `/api/support/state` strip customer PII and admin-only blobs for non-admin requests and scope visitor support threads by `visitorSessionId`.
- **Manual-Only MFS Wallet Top-Up Approval**: Removed all automatic wallet top-up approval logic from both backend and frontend. Customer MFS requests submitted via `POST /api/wallet/topup` always enter a `pending` state, and wallet balance is credited strictly on explicit administrator approval at `POST /api/wallet/topup/:id/decision`.
- **SSRF & Outbound URL Guard**: Server-side webhook/external fetch triggers validate hostnames and resolved DNS IP addresses (`assertSafeExternalUrl`), rejecting localhost, private, link-local, and metadata IP ranges before making outbound requests.
- **Customer-Scoped Order History & Dashboard**: `CustomerDashboardModal.tsx` scopes order history and wallet top-up records to the logged-in customer (`phone` / `email`), adds status filtering, item thumbnails, live courier tracking, and safe 1-click re-order, and fixes responsive header spacing across viewports.
- **Estimated Delivery Date Range & Server Startup Stability**: Added `calculateEstimatedDeliveryRange` in `ProductDetailModal.tsx` based on selected district zone, 5:00 PM same-day dispatch cutoff, and transit days (skipping Fridays on outside-Dhaka courier routes). Fixed `server.ts` port selection so it binds reliably to `3000` (avoiding collision with the container proxy on `8080`), disabled standalone Vite HMR port binding (`24678`), and corrected the startup marketing sweep function invocation (`runAutonomousMarketingSweep`).

## PoC Verification

All checks were executed against the compiled TypeScript codebase, Vite production build, and live server running on `http://127.0.0.1:3000` while preserving all existing records in `data/store.json` (`13` products, `2` orders, `131` reviews, `7` spinRewards, `1` walletTopUp, `1` customerAccount):

1. **Build & Type Check**:
   - `npm run lint` (`tsc --noEmit`): exited cleanly with `0` errors.
   - `npm run build` (`vite build`): transformed `1761` modules and produced `dist/index.html` cleanly with `0` errors.
2. **Dev Server Port & Health**:
   - `GET http://127.0.0.1:3000/` returned HTTP `200` with rendered SPA shell (`id="root"`).
   - `GET http://127.0.0.1:3000/api/admin/auth/status` returned HTTP `200` (`{ success: true, isConfigured: true, envConfigured: true, claimAllowed: false }`).
3. **Access Control & PII Redaction Checks**:
   - `GET http://127.0.0.1:3000/api/store/backup` without Bearer auth -> rejected with HTTP `401`.
   - `POST http://127.0.0.1:3000/api/marketing/sms-campaign` without Bearer auth -> rejected with HTTP `401`.
   - `POST http://127.0.0.1:3000/api/wallet/topup/fake-id/decision` without Bearer auth -> rejected with HTTP `401`.
   - `GET http://127.0.0.1:3000/api/n8n/workflow.json?download=1` without Bearer auth -> rejected with HTTP `401`.
   - `GET http://127.0.0.1:3000/api/store/sync` without Bearer auth -> returned HTTP `200` with customer phone/PII fields redacted (`""`).
   - `GET http://127.0.0.1:3000/api/support/state` without Bearer auth or matching `visitorSessionId` -> returned `0` support chats.
4. **Delivery Date Estimator Function**:
   - Verified `calculateEstimatedDeliveryRange` output across zones, cutoff times, and languages (`Nov 29 – Nov 30` for morning `dhaka_inside`, `Nov 30 – Dec 2` for `dhaka_outside`, `Nov 30 – Dec 1` after 5:00 PM cutoff, and localized Bangla output `২৯ নভে – ৩০ নভে`).
