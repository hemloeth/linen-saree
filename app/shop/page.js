import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopCatalog from "@/components/ShopCatalog";

export const metadata = {
  title: "Shop all sarees",
  description:
    "Filter handwoven sarees by price, fabric, colour and availability. Silk, cotton, georgette, muslin and tissue — dispatched within 24 hours.",
};

export default function ShopPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-[1240px] px-4 py-8 lg:px-10 lg:py-12">
          <div className="mb-6 lg:mb-8">
            <h1 className="font-display text-xl font-medium uppercase tracking-[0.16em] text-pine-950 sm:text-2xl">
              Shop all sarees
            </h1>
            <p className="mt-1 text-xs text-muted">
              Every piece is woven by hand — no two are identical.
            </p>
            <span aria-hidden="true" className="mt-3 block h-px w-16 bg-pine-950/40" />
          </div>

          <ShopCatalog />
        </div>
      </main>
      <Footer />
    </>
  );
}