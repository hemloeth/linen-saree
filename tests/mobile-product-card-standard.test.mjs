import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

test("Mobile Product Card Standard Suite", async (t) => {
  await t.test("1. ProductCard component exists and exports default function", () => {
    const cardFile = path.join(ROOT, "components", "ProductCard.js");
    assert.ok(fs.existsSync(cardFile), "ProductCard.js should exist");
    const content = fs.readFileSync(cardFile, "utf8");
    assert.match(content, /export default function ProductCard/, "Must export ProductCard component");
  });

  await t.test("2. Full image visibility: uses object-contain with p-1 and subtle theme background", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ProductCard.js"), "utf8");
    assert.match(content, /object-contain/, "Must use object-contain so saree/pallu is not cropped");
    assert.match(content, /aspect-\[4\/5\]/, "Must maintain consistent aspect-[4/5] portrait ratio");
    assert.doesNotMatch(content, /object-cover object-top/, "Must not use cropping object-cover object-top");
  });

  await t.test("3. No duplicated discount badges: single discount badge in price area only", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ProductCard.js"), "utf8");
    // Ensure the top-left badge only renders New, not a duplicate % OFF badge
    assert.match(content, /product\.isNew/, "Renders New badge when applicable");
    assert.doesNotMatch(content, /left-2.*% OFF/, "Must not duplicate discount badge on the top of the image");
    assert.match(content, /\{off\}% off/, "Renders discount percentage beside MRP in price row");
  });

  await t.test("4. Compact action buttons: AddToBag and BuyNow share single horizontal row", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ProductCard.js"), "utf8");
    assert.match(content, /AddToBagButton/, "Includes AddToBagButton");
    assert.match(content, /BuyNowButton/, "Includes BuyNowButton");
    // Check horizontal flex row container
    assert.match(content, /flex items-stretch gap-1/, "Buttons must share a single horizontal row with tight gap");
    // Check height is within 34-40px standard
    assert.match(content, /h-\[34px\].*sm:h-\[36px\]/, "Action buttons height must be 34-36px");
  });

  await t.test("5. Out of stock products render non-purchasable compact banner", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ProductCard.js"), "utf8");
    assert.match(content, /product\.inStock \?/, "Conditionally renders actions or Out of Stock banner");
    assert.match(content, /Out of Stock/, "Renders Out of Stock label when out of stock");
  });

  await t.test("6. Wishlist button accessible and does not bubble navigation", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ProductCard.js"), "utf8");
    assert.match(content, /toggleWishlist\(product\.id\)/, "Connects to store wishlist toggle");
    assert.match(content, /e\.preventDefault\(\)/, "Prevents default to stop navigation");
    assert.match(content, /e\.stopPropagation\(\)/, "Stops event propagation");
    assert.match(content, /aria-pressed=\{wished\}/, "Includes aria-pressed attribute");
  });

  await t.test("7. Performance & Touch handling: hover cycling guarded against touch-only and reduced-motion", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ProductCard.js"), "utf8");
    assert.match(content, /hover: hover/, "Checks for hover pointer capability before starting cycle");
    assert.match(content, /prefers-reduced-motion/, "Respects user reduced-motion preference");
    assert.doesNotMatch(content, /useIsTouchDevice/, "Does not use flawed hook causing setState in effect");
  });

  await t.test("8. ProductActions provides feedback states for Add to Cart and Buy Now", () => {
    const content = fs.readFileSync(path.join(ROOT, "components", "ProductActions.js"), "utf8");
    assert.match(content, /justAdded/, "AddToBagButton provides justAdded feedback state");
    assert.match(content, /navigating/, "BuyNowButton provides navigating state to prevent double submit");
    assert.match(content, /disabled=\{!product\?\.inStock/, "Buttons disabled when out of stock");
  });

  await t.test("9. Grid gaps standardized across all product grids (2.5 on mobile, 6 on desktop)", () => {
    const arrivals = fs.readFileSync(path.join(ROOT, "components", "NewArrivalsSection.js"), "utf8");
    assert.match(arrivals, /grid grid-cols-2 gap-2\.5 sm:gap-3 md:grid-cols-3 lg:grid-cols-4 lg:gap-6/, "NewArrivals uses standardized 2.5 mobile gap");

    const catalog = fs.readFileSync(path.join(ROOT, "components", "ShopCatalog.js"), "utf8");
    assert.match(catalog, /grid grid-cols-2 gap-2\.5/, "ShopCatalog uses standardized 2.5 mobile gap");

    const filtered = fs.readFileSync(path.join(ROOT, "components", "merchandising", "FilteredProducts.js"), "utf8");
    assert.match(filtered, /grid grid-cols-2 gap-2\.5/, "FilteredProducts uses standardized 2.5 mobile gap");

    const wishlist = fs.readFileSync(path.join(ROOT, "app", "wishlist", "page.js"), "utf8");
    assert.match(wishlist, /grid grid-cols-2 gap-2\.5/, "Wishlist uses standardized 2.5 mobile gap");

    const productPage = fs.readFileSync(path.join(ROOT, "components", "ProductPageView.js"), "utf8");
    assert.match(productPage, /grid grid-cols-2 gap-2\.5/, "ProductPageView related and explore use standardized 2.5 mobile gap");
  });

  await t.test("10. Carousel supports responsive card width containers without fixed clipping", () => {
    const carousel = fs.readFileSync(path.join(ROOT, "components", "ProductCarousel.js"), "utf8");
    assert.match(carousel, /w-\[44vw\] min-w-\[150px\] max-w-\[200px\]/, "Carousel uses fluid mobile width wrappers");
  });
});
