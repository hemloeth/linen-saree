# House of Qalakari — saree storefront

Marketing storefront implemented from the Figma design **House of Qalakari — E-commerce Saree Website Design**.

## Stack

- Next.js 16.4.6 (App Router, Turbopack, Cache Components)
- React 19.3
- Tailwind CSS v4 (design tokens declared in `app/globals.css`)
- `next/font` — Cinzel (display) + Inter (UI); body uses the Helvetica/Arial stack from the design

## Routes

| Route | Source |
| --- | --- |
| `/` | Home Page frame (`233:14398`) |
| `/collections` | Top Collection (`233:14382`) |
| `/collections/fabric` | Collection Page, by fabric (`236:19492`) |
| `/collections/occasion` | Collection Page, by occasion (`236:19803`) |
| `/product` | Product Page (`233:14327`) |
| `/shop` | Catalogue with filter + sort sidebar (no Figma frame — layout mechanic) |
| `/video-collection` | Reel grid + category pills (no Figma frame) |
| `/wishlist` | Saved pieces (no Figma frame) |

## Structure

```
app/
  layout.js              fonts, metadata, StoreProvider
  globals.css            Tailwind v4 theme tokens + --header-offset
  page.js                home composition
  collections/…          collection routes sharing CollectionPageView
  product/page.js        product detail + reviews + recommendations
  shop/page.js           filterable catalogue
  video-collection/      reel grid
  wishlist/              saved pieces
components/
  StoreProvider.js       bag, wishlist, overlays (persisted to localStorage)
  Header.js  AnnouncementBar.js  MobileNav.js  Wordmark.js
  SearchModal.js  CartDrawer.js  BagButton.js  WishlistButton.js  BackToTop.js
  HeroCarousel.js  SectionHeading.js  CollectionCard.js  CollectionPageView.js
  ProductCard.js  ProductCarousel.js  ReelCarousel.js  TestimonialCarousel.js
  ProductGallery.js  ProductDetail.js  ProductReviews.js  Stars.js
  ColorSwatches.js  CountdownTimer.js  Accordion.js  ProductActions.js
  ShopCatalog.js  VideoGrid.js  Footer.js  Newsletter.js
lib/data.js              catalogue, collections, reels, reviews, trust points
public/images/           assets exported from the Figma file
```

## Storefront mechanics

- **Sticky header** publishes its height as `--header-offset` via `ResizeObserver`; `scroll-padding-top` uses it so anchors clear the bar. Dismissing the announcement shrinks the offset (109px → 81px).
- **Announcement bar** remembers dismissal in `localStorage` (`hoq_announcement_dismissed`).
- **Navigation**: desktop dropdowns (Categories, Collections), Ctrl/⌘+K search, wishlist badge, bag badge; mobile drawer with accordions.
- **Search modal** matches name, SKU, fabric and colour; quick tags; Esc closes.
- **Bag drawer**: line items, quantity steppers, remove, free-shipping progress, subtotal. Bag and wishlist persist in `localStorage` (`hoq_bag_v1`, `hoq_wishlist_v1`).
- **Product cards**: `aspect-[500/650]`, sale-% / New / Video badges, wishlist overlay, rating + review count, sold-out ribbon, and a multi-image hover gallery that preloads the set and cross-fades (degrades to a single frame when a product has one photo).
- **Product detail**: SKU, rating summary, tax-inclusive price, fabric/size, stock + dispatch, coupon block, pincode delivery estimate, trust badges, accordions, sticky mobile action bar, reviews with rating breakdown and a write-a-review form, and a "More to explore" grid.
- **Shop catalogue**: price bands, fabric, colour, in-stock filters, five sort orders, mobile filter drawer.
- **Video collection**: hero reel, category pills, portrait reel grid.


## Design tokens

| Token | Value | Use |
| --- | --- | --- |
| `pine-950` | `#092b2b` | announcement bar, countdown, primary hover |
| `pine-900` | `#0c3c3c` | primary buttons, prices, banners |
| `pine-800` | `#104d4d` | wordmark, section accents |
| `sage` | `#c7dcce` | header bar, logo disc |
| `linen` | `#e3eee7` | footer background |
| `aqua` | `#b0efef` | add-to-bag CTA on product page |
| `gold` | `#f9a000` | testimonial stars |

## Figma data

The file was read through the Figma REST API (`FIGMA_TOKEN` / `FIGMA_FILE_KEY` in `.env.local`, which is gitignored). Frame renders and node JSON were extracted during the build; the raw exports live in `.design-ref/` (gitignored, local reference only). Image fills were downloaded to `public/images/` and renamed semantically (`hero-1`, `product-3`, `collection-silk-sarees`, …).

## Behaviour implemented

- Hero carousel: autoplay, arrows, dots, first slide preloaded as LCP.
- Product carousels: scroll-snap with arrow paging.
- Reels and testimonial carousels.
- Product page: gallery, colour swatches, offer countdown, coupon block, details accordion.
- Cart: `CartProvider` context; add-to-bag updates the header badge and shows a confirmation toast; wishlist toggles per card.
- Newsletter form validates the email and confirms inline.

## Responsive layout

The Figma file ships 412 px mobile frames only (plus one 1440×600 sage banner), so the desktop layout is art-directed from the same tokens:

| Breakpoint | Layout |
| --- | --- |
| `< 640 px` | Single column; hero is a full-bleed image with overlay copy; carousels scroll with arrow paging; testimonials one card per view |
| `640–1023 px` | Two-up category cards, wider cards, single search strip |
| `≥ 1024 px` | Split hero (copy panel + slide), 5-up product grids, 6-up reels, 3-up testimonial grid, 4-column footer, max content width 1240 px |

## Scripts

```bash
npm run dev     # dev server
npm run build   # production build
npm run lint    # eslint
```