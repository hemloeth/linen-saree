import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutView from "@/components/checkout/CheckoutView";

export const metadata = { title: "Checkout" };

export default function CheckoutPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <CheckoutView />
      </main>
      <Footer />
    </>
  );
}
