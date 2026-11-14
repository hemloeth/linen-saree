# House of Qalakari – structured integration notes

## Implemented in this ZIP
- API client (`lib/api/client.js`) with cookies and CSRF preflight header.
- Product API adapter (`lib/api/products.js`) maps backend records into **unchanged** Qalakari UI components.
- Live home/shop/search/wishlist product data, per-product URLs and gallery images.
- New-theme sign in / register interface (`/account`) and guest-to-account wishlist sync.
- Reusable state in `StoreProvider`, AuthForm and AccountLink.
- Design tokens, typography, illustrations and old-theme visual components were NOT imported.

## Required before live deployment
1. Set NEXT_PUBLIC_API_BASE_URL to the running API host, without `/api` at the end. Add the frontend origin to Express CORS allowlist.
2. **Multi-store identity isolation is NOT implemented**. Current backend uses email-only unique accounts and login. Do NOT launch website B account creation expecting independent accounts on the existing production backend. Backend needs storeId migration, compound indexes, store-verified sessions, OTP/reset protection, and order/cart/wishlist isolation.
3. Backend currently lacks `GET /api/user/me`. The new frontend intentionally does not persist bearer tokens. After refresh, account UI shows signed-out, although server HttpOnly cookie may remain valid. Implement a secure session `/me` endpoint and hydrate account state before launch.
4. Added checkout address UI and a gated COD order client, and order history/tracking view. Full Razorpay/UPI/coupon/refund/cancellation, server cart sync and store-safe shipping flow remain pending. Checkout stays disabled by default pending backend multi-store work.
5. Revalidate image URL host policy, alt text, product gallery behavior and end-to-end purchases in staging.
6. Catalog fetch loads pages of 100, maximum 100 pages; a server-side pagination/infinite-list implementation is recommended at large scale.
7. When API URL is unset, the existing design demo catalog is used. With a configured API URL, an API failure shows an error rather than mock product data.

Run `npm install`, copy `.env.example` to `.env.local`, and `npm run build`.
