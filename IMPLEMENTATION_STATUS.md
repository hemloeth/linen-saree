# House of Qalakari – integration status

## Implemented in source
- The original Qalakari color palette, layout and component styling is retained. The old Handloomer design is **not copied**.
- Home now starts Hero → New Arrivals products → Categories → original Qala Banarasi cards → Fabric & Occasion → Trending → Collections → Video Collection → Bestsellers. Existing promotional/service areas are retained.
- `lib/api/merchandising.js` retrieves the existing backend's `/api/category/allcategory` and `/api/marketing-collections`. `lib/api/products.js` maps category, collection, images and video metadata. Category/collection browse routes render real matching catalog data when configured.
- Product detail includes existing image gallery, reviews API, similar products, more to explore, and real serviceability check. Fake 30% coupon and arbitrary offer timer have been removed from the live product detail page.
- Video collection uses actual product `videoFile` / `videoUrl`, does not autoplay an entire grid, loads only on user click, and shows an empty state when no real videos exist.
- Checkout and shipping address form are implemented as UI, with **COD order API** integration behind an explicit disabled-by-default flag. The bag links to checkout; Buy Now leads there. Orders page fetches protected order history and tracking when an authenticated session is available.
- Customer reviews fetch approved reviews and can submit for moderation.
- Account and wishlist work from the previous integration package.

## Critical deployment blockers — not complete or production-verified
1. **Multi-store identity is NOT supported by the existing backend:** it uses email-based unique users and same auth cookie. Store-aware backend migration and security enforcement are mandatory before enabling account creation or orders for the new website. The old backend source ZIP is untouched.
2. **Checkout is OFF by default** (`NEXT_PUBLIC_ENABLE_STORE_CHECKOUT=false`). It only contains a COD order client, NOT the old website's full Razorpay/UPI/coupon/return/refund payment flow. Do NOT turn on without updating backend for store isolation and running end-to-end payment/shipping testing.
3. Backend has no `GET /api/user/me`; session state cannot be restored across reloads. Do not consider account login production ready until this is added.
4. Shared frontend cart is locally persisted; the old backend's cart sync, address persistence, account profile management, cancellation, guest checkout recovery, prepaid payments and robust tracking UI still require dedicated integration.
5. Marketing collections may be editorial-only and not directly match `productCollection`. Empty states are shown instead of inventing product mappings. Map editorial keys to actual catalog filters where appropriate.
6. Browser/server build, staging API access, and real purchase, refund and responsive layout tests are required before deploy. No production server or customer data was modified.

## Setup
`npm install`; copy `.env.example` into `.env.local`; set `NEXT_PUBLIC_API_BASE_URL` to the backend base URL without `/api` and add the frontend origin to Express CORS. Run `npm run build`. `NEXT_PUBLIC_ENABLE_STORE_CHECKOUT` must remain false until above blockers are resolved.
