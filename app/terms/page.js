import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Terms of Service - Linen Saree",
  description: "Terms and conditions governing the use of Linen Saree website and services.",
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="border-b border-pine-950/10 bg-linen py-16 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-6 text-center lg:px-10">
            <span className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-pine-800">
              User Agreement
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-pine-950 sm:text-5xl">
              Terms of Service
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-inter text-sm leading-relaxed text-muted sm:text-base">
              Please review these terms before browsing or purchasing from our online handloom store.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[900px] px-6 py-16 font-inter text-sm leading-relaxed text-muted lg:px-10 lg:py-20">
          <div className="space-y-10">
            <section>
              <h2 className="font-display text-xl font-semibold text-pine-950">
                1. Acceptance of Terms
              </h2>
              <p className="mt-3">
                By accessing, browsing, or purchasing from <strong className="text-pine-950">linensaree.com</strong>, you agree to comply with and be bound by these Terms of Service. If you do not agree with any part of these terms, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pine-950">
                2. Authentic Handloom Craftsmanship & Color Representation
              </h2>
              <p className="mt-3">
                All sarees showcased on Linen Saree are authentic handloom creations crafted by traditional artisans. Because each piece is woven on manual pit looms, subtle variations in thread tension, slub textures, and motif alignment are innate characteristics that make each saree one-of-a-kind. While we strive to present accurate colors, display screens may cause slight visual variations in shade.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pine-950">
                3. Pricing and Availability
              </h2>
              <p className="mt-3">
                All prices listed on the website are in Indian Rupees (INR) inclusive of applicable goods and services taxes (GST). We reserve the right to revise product pricing, discontinue items, or adjust shipping rates without prior notification. In the event of an inadvertent technical pricing discrepancy, we will contact you before dispatching your order.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pine-950">
                4. Orders and Cancellations
              </h2>
              <p className="mt-3">
                Orders can be cancelled before dispatch by visiting the Track Order page or reaching our support team via WhatsApp. Once an order is handed over to our courier partners, our standard 7-day return policy applies upon delivery.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pine-950">
                5. Governing Law & Jurisdiction
              </h2>
              <p className="mt-3">
                These terms are governed by the laws of India. Any legal disputes arising out of the use of this website or orders placed through it shall be subject to the exclusive jurisdiction of the competent courts in India.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

