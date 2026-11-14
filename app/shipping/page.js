import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Shipping & Returns - Linen Saree",
  description: "Learn about shipping times, delivery rates, and return policy for your Linen Saree orders.",
};

export default function ShippingPage() {
  const domesticRates = [
    {
      method: "Prepaid Orders (Card / UPI / Netbanking)",
      cost: "FREE",
      timeframe: "3-5 business days",
      description: "Enjoy complimentary express shipping across India on all prepaid orders above ₹999.",
    },
    {
      method: "Cash on Delivery (COD)",
      cost: "₹100 handling fee",
      timeframe: "5-7 business days",
      description: "Pay securely at your doorstep upon delivery.",
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="border-b border-pine-950/10 bg-linen py-16 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-6 text-center lg:px-10">
            <span className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-pine-800">
              Orders & Deliveries
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-pine-950 sm:text-5xl">
              Shipping & Returns
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-inter text-sm leading-relaxed text-muted sm:text-base">
              Transparent, reliable shipping straight from our handloom workshops to your doorstep across India.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[1000px] px-6 py-16 lg:px-10 lg:py-20">
          {/* Shipping Rates */}
          <section className="space-y-6">
            <h2 className="font-display text-2xl font-semibold text-pine-950">
              Domestic Shipping (India)
            </h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {domesticRates.map((rate) => (
                <div
                  key={rate.method}
                  className="rounded-xl border border-pine-950/10 bg-linen/40 p-6"
                >
                  <h3 className="font-display text-lg font-semibold text-pine-950">
                    {rate.method}
                  </h3>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-xl font-bold text-pine-900">{rate.cost}</span>
                    <span className="text-xs text-muted">({rate.timeframe})</span>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted sm:text-sm">
                    {rate.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Returns Policy */}
          <section className="mt-16 border-t border-pine-950/10 pt-12 space-y-4">
            <h2 className="font-display text-2xl font-semibold text-pine-950">
              7-Day Hassle-Free Returns & Exchange
            </h2>
            <p className="text-sm leading-relaxed text-muted">
              We want you to love your saree. If you receive an item with any manufacturing defect, weaving flaw, or if it does not meet your expectations, you can initiate a return or exchange within <strong className="text-pine-950">7 days</strong> of delivery.
            </p>
            <ul className="list-disc space-y-2 pl-5 text-sm text-muted">
              <li>The saree must remain unstitched, unwashed, and in its original fold with tags intact.</li>
              <li>Blouse pieces that have been cut or stitched cannot be returned or exchanged.</li>
              <li>Handloom irregularities (such as subtle slubs, knot variations, and dye tones) are natural characteristics of pit-loom weaving and attest to authentic craftsmanship.</li>
            </ul>
          </section>

          {/* How to initiate */}
          <section className="mt-12 rounded-xl bg-linen p-6 sm:p-8">
            <h3 className="font-display text-lg font-semibold text-pine-950">
              Need to initiate a return or track your package?
            </h3>
            <p className="mt-2 text-xs text-muted sm:text-sm">
              Visit our <a href="/track-order" className="font-medium text-pine-900 underline">Track Order</a> page with your Order ID, or message our WhatsApp concierge at <a href="https://wa.me/919264151111" className="font-medium text-pine-900 underline">+91 92641 51111</a>.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

