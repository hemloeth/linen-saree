import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Privacy Policy - Linen Saree",
  description: "Learn how Linen Saree collects, protects, and handles your personal information.",
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        <div className="border-b border-pine-950/10 bg-linen py-16 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-6 text-center lg:px-10">
            <span className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-pine-800">
              Legal & Trust
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-pine-950 sm:text-5xl">
              Privacy Policy
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-inter text-sm leading-relaxed text-muted sm:text-base">
              Your trust is our cornerstone. We protect your personal data with utmost transparency and security.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-[900px] px-6 py-16 font-inter text-sm leading-relaxed text-muted lg:px-10 lg:py-20">
          <div className="space-y-10">
            <section>
              <h2 className="font-display text-xl font-semibold text-pine-950">
                1. Information We Collect
              </h2>
              <p className="mt-3">
                When you visit or place an order on <strong className="text-pine-950">linensaree.com</strong>, we collect personal information you provide to us, including your full name, shipping and billing address, email address, and phone number. This information is strictly used for order processing, logistics coordination, and shipment status updates.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pine-950">
                2. Payment Security
              </h2>
              <p className="mt-3">
                All payment transactions are handled through certified, PCI-DSS compliant third-party payment gateways (including Razorpay, Cashfree, UPI, and major banks). We do not store or have direct access to your credit card numbers, debit card details, or banking PINs.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pine-950">
                3. Use of Cookies
              </h2>
              <p className="mt-3">
                We use functional cookies to remember your shopping bag items, recently viewed sarees, and session preferences. These cookies help us enhance your browsing experience and ensure seamless checkout continuity.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pine-950">
                4. Third-Party Sharing
              </h2>
              <p className="mt-3">
                We will never sell, rent, or trade your personal information to third-party marketers. We share necessary shipping information exclusively with trusted logistics partners (such as Delhivery, Blue Dart, and India Post) to fulfill your doorstep deliveries.
              </p>
            </section>

            <section>
              <h2 className="font-display text-xl font-semibold text-pine-950">
                5. Contacting Us
              </h2>
              <p className="mt-3">
                If you have questions about our privacy practices, or wish to update or delete your profile information, please write to us at <a href="mailto:privacy@linensaree.com" className="font-medium text-pine-900 underline">privacy@linensaree.com</a>.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

