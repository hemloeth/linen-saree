import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Returns & Exchanges - Linen Saree",
  description: "Learn about our 7-day return procedure, exchange options, eligibility, and refund timeline.",
};

export default function ReturnsPage() {
  const steps = [
    {
      step: "01",
      title: "Initiate Request",
      description: "Contact our WhatsApp support at +91 92641 51111 or visit Track Order within 7 days of receiving your package.",
    },
    {
      step: "02",
      title: "Eligibility Check",
      description: "Ensure the saree is unstitched, unwashed, and in original folding with all security tags intact.",
    },
    {
      step: "03",
      title: "Doorstep Pickup",
      description: "Our courier partner will arrive at your address to inspect and safely collect the return shipment.",
    },
    {
      step: "04",
      title: "Prompt Refund / Exchange",
      description: "Once received and verified at our fulfillment hub, refunds are credited back within 48 hours, or replacement items dispatched.",
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero */}
        <div className="border-b border-pine-950/10 bg-linen py-16 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-6 text-center lg:px-10">
            <span className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-pine-800">
              Customer Assurance
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-pine-950 sm:text-5xl">
              Returns &amp; Exchanges Policy
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-inter text-sm leading-relaxed text-muted sm:text-base">
              Hassle-free 7-day returns and exchanges for complete peace of mind.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[950px] px-6 py-16 lg:px-10 lg:py-20">
          {/* 4-Step Process */}
          <section>
            <h2 className="font-display text-2xl font-semibold text-pine-950 sm:text-3xl">
              How the Return Process Works
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {steps.map((s) => (
                <div key={s.step} className="rounded-xl border border-pine-950/10 bg-linen/30 p-5">
                  <span className="font-display text-2xl font-bold text-pine-800">{s.step}</span>
                  <h3 className="mt-2 font-display text-base font-semibold text-pine-950">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">{s.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Conditions */}
          <section className="mt-16 border-t border-pine-950/10 pt-12">
            <h2 className="font-display text-2xl font-semibold text-pine-950">
              Return &amp; Exchange Conditions
            </h2>
            <div className="mt-6 space-y-4 font-inter text-sm leading-relaxed text-muted">
              <p>
                To be eligible for a full refund or exchange:
              </p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Items must be initiated for return within <strong className="text-pine-950">7 calendar days</strong> from delivery.</li>
                <li>The saree must be completely unstitched (attached blouse piece must not be cut or separated).</li>
                <li>The fabric must be unwashed, unworn, and free from any perfumes, marks, or odors.</li>
                <li>Handloom textures (such as subtle slub irregularities and natural yarn variations) are authentic characteristics of manual pit-loom weaving and are not considered defects.</li>
              </ul>
            </div>
          </section>

          {/* Refund Modes */}
          <section className="mt-14 rounded-2xl border border-pine-950/10 bg-linen p-7 sm:p-9">
            <h3 className="font-display text-xl font-semibold text-pine-950">
              Refund Timelines &amp; Methods
            </h3>
            <p className="mt-2 text-xs text-muted sm:text-sm">
              • <strong>Prepaid Orders (Cards/UPI/Netbanking):</strong> Refunds are credited directly back to the original source payment method within 3–5 business days.
            </p>
            <p className="mt-1.5 text-xs text-muted sm:text-sm">
              • <strong>Cash on Delivery (COD):</strong> Refunds are transferred via instant UPI or NEFT bank transfer upon receiving your account details.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

