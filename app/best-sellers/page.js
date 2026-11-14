import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FilteredProducts from "@/components/merchandising/FilteredProducts";

export const metadata = {
  title: "Best Sellers — House of Qalakari",
  description: "Discover our most coveted handcrafted sarees, loved and reviewed by our customers.",
};

export default function BestSellersPage() {
  return (
    <>
      <Header />
      <FilteredProducts kind="bestseller" value="best-sellers" />
      <Footer />
    </>
  );
}

