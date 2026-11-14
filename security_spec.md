# BuyOne BD Firestore Security Specification

## 1. Data Invariants
1. **Default Deny**: All unmatched paths default to `allow read, write: if false;`.
2. **Public Storefront Settings (`/storefront/{configId}`) & Catalog (`/products/{productId}`)**: Publicly readable (`get`, `list`) so any shopper sees live Flash Sale timers, Theme Brand Colors, and Products. Only verified Admin accounts (`isAdmin()`) may create, update, or delete settings and products.
3. **PII Isolation on Orders (`/orders/{orderId}`)**: Customer PII (`name`, `phone`, `address`) is never publicly readable (`allow read` strictly restricted to `isAdmin()`). Shoppers may submit new orders via `allow create` with strict schema, type, size, and initial status (`pending` or `partial`) validation plus server timestamp integrity (`serverCreatedAt == request.time`).
4. **Admin Allowlist (`/admins/{uid}`)**: Verified admin (`buyonebd@gmail.com` with `email_verified == true` or registered admin doc) only.

## 2. Adversarial "Dirty Dozen" Payloads (All Rejected with PERMISSION_DENIED)
1. Unauthenticated `get` / `list` read on `/orders` -> Rejected (`isAdmin()` required).
2. Unauthenticated `update` or `delete` on `/orders/{orderId}` -> Rejected (`isAdmin()` required).
3. Order `create` injecting terminal status `delivered` or `cancelled` directly from client -> Rejected (`status in ['pending', 'partial']`).
4. Order `create` with shadow/extra ghost key (`isAdmin: true`) -> Rejected (`hasOnly(...)` whitelist).
5. Order `create` with spoofed `serverCreatedAt` timestamp (`!= request.time`) -> Rejected.
6. Order `create` with >128-char poisoned document ID (`invalid$id`) -> Rejected by `isValidId()`.
7. Order `create` with empty items array or >50 items -> Rejected (`items.size() >= 1 && items.size() <= 50`).
8. Order `create` with negative pricing total -> Rejected (`pricing.total >= 0`).
9. Signed-in non-admin user trying to write `/storefront/public` -> Rejected (`isAdmin()` required).
10. Signed-in non-admin user trying to self-register in `/admins/{uid}` -> Rejected.
11. Unverified email claim matching admin email (`email_verified: false`) -> Rejected (`email_verified == true` enforced).
12. Unlisted collection read/write (e.g. `/secrets/key`) -> Rejected by catch-all deny rule.
