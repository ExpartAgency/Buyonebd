# BuyOne BD Unified Firebase Security Specification

## 1. Data Invariants
1. **Default Deny**: All unmatched paths default to `allow read, write: if false;`.
2. **Public Storefront Settings (`/storefront/{configId}`)**: Publicly readable (`get`, `list`) for storefront display (theme colors, flash sale, delivery fees, categories, sliders, CMS labels, promo coupons). Secrets (SMTP password, courier API keys, CAPI/WhatsApp access tokens) are excluded and isolated in `/admin_config/private`. Admin write only (`isAdmin()`).
3. **Private Admin Settings Vault (`/admin_config/{configId}`)**: Holds sensitive Admin Dashboard configs (`smtpSettings`, `courierSettings`, `marketingSettings`, `aiKeywordRules`). Strictly `isAdmin()` read and write.
4. **Catalog Products (`/products/{productId}`) & Media Library (`/media_library/{mediaId}`)**: Publicly readable (`get`, `list`), strictly `isAdmin()` writable with strict field allowlists, ID regex guards, and server timestamp integrity.
5. **Product Reviews (`/reviews/{reviewId}`)**: Public `list` strictly filtered via `resource.data.isApproved == true || isAdmin()`; shoppers may submit new reviews with `isApproved` and server `createdAt == request.time`; Admin manages approvals, edits, and deletions.
6. **PII Isolation on Customer & Financial Collections**:
   - `/orders/{orderId}`: Public `create` for checkout (`status in ['pending', 'partial'] || isAdmin()`), strictly `isAdmin()` for `get`, `list`, `update`, `delete`.
   - `/customers/{customerId}`: Customer profiles, phone/email, wallet balance, loyalty points — strictly `isAdmin()` read and write.
   - `/wallet_topups/{topupId}`: Shoppers may `create` (`status == 'pending'`), strictly `isAdmin()` for `get`, `list`, `update`, `delete`.
   - `/price_alerts/{alertId}` & `/abandoned_carts/{cartId}`: Shoppers may `create` validated records, strictly `isAdmin()` for `get`, `list`, `update`, `delete`.
   - `/staff_users/{userId}` & `/admins/{uid}`: Strictly `isAdmin()`.

## 2. Adversarial "Dirty Dozen" Payloads (All Rejected with PERMISSION_DENIED)
1. Unauthenticated `get` / `list` on `/admin_config/private`, `/orders`, `/customers`, `/wallet_topups`, `/price_alerts`, `/abandoned_carts`, `/staff_users`.
2. Unauthenticated `list` on `/reviews` without `where('isApproved', '==', true)`.
3. Unauthenticated `update` or `delete` on `/orders/{orderId}` or `/wallet_topups/{topupId}`.
4. Order `create` injecting terminal status `delivered` or `cancelled` directly from unauthenticated shopper.
5. Wallet Top-Up `create` injecting pre-approved `status: 'approved'` from unauthenticated shopper.
6. Any document `create` injecting shadow/ghost keys (e.g., `isAdmin: true`) outside `hasOnly(...)`.
7. Any document `create` with spoofed `createdAt` / `serverCreatedAt` != `request.time`.
8. Document ID poisoning (`>128` chars or special characters failing `isValidId()`).
9. Negative monetary/numeric values (`pricing.total < 0`, `walletBalance < 0`, `amount <= 0`).
10. Signed-in non-admin user trying to write `/storefront/public` or `/admin_config/private`.
11. Unverified Google email claim (`email_verified: false`) attempting admin access.
12. Read/write to any unlisted collection (rejected by `/{document=**}`).
