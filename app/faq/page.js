"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const faqData = [
  {
    category: "Contact & Account",
    question: "How do I contact Linen Saree customer care?",
    answer: "You can reach us directly via WhatsApp or call at +91 92641 51111 from Monday to Saturday (10:00 AM to 6:30 PM IST). You can also email us at care@linensaree.com.",
  },
  {
    category: "Contact & Account",
    question: "Do I need an account to place an order?",
    answer: "No, you can place orders as a guest with your phone number and email. However, creating an account helps you track order history, view saved addresses, and manage your wishlist.",
  },
  {
    category: "Products & Orders",
    question: "Are your sarees authentic handloom pure linen?",
    answer: "Yes, every saree in our catalog is handwoven on traditional manual pit looms by skilled artisan weavers. We use certified natural flax linen fibers with zero synthetic or polyester blends.",
  },
  {
    category: "Products & Orders",
    question: "Does the saree come with a blouse piece?",
    answer: "Yes, all our sarees include an 80 cm unstitched running or contrast blouse piece attached to the 5.5-metre drape, giving you a total length of 6.3 metres.",
  },
  {
    category: "Products & Orders",
    question: "What payment methods are supported?",
    answer: "We support all major Indian payment methods: UPI (Google Pay, PhonePe, Paytm, BHIM), Credit/Debit Cards (Visa, Mastercard, RuPay), Net Banking across 50+ banks, and Cash on Delivery (COD) for domestic orders.",
  },
  {
    category: "Shipping & Delivery",
    question: "How long does shipping take?",
    answer: "In-stock sarees are dispatched within 24-48 hours. Express delivery takes 3 to 5 business days for major metro cities across India, and 5 to 7 days for regional destinations.",
  },
  {
    category: "Shipping & Delivery",
    question: "Do you offer free delivery?",
    answer: "Yes, we offer complimentary free express shipping on all prepaid orders above ₹999 across India.",
  },
  {
    category: "Shipping & Delivery",
    question: "How do I track my shipment?",
    answer: "Once your parcel is dispatched, you will receive an SMS and email with live courier tracking details. You can also visit our Track Order page anytime with your Order ID.",
  },
  {
    category: "Returns & Exchanges",
    question: "What is your return policy?",
    answer: "We offer a 7-day hassle-free return and exchange policy from the date of delivery. The saree must remain unstitched, unwashed, and in its original fold with tags intact.",
  },
  {
    category: "Returns & Exchanges",
    question: "How do I initiate a return or exchange?",
    answer: "Simply message our WhatsApp concierge at +91 92641 51111 or visit the Track Order page to request a return. We will arrange a doorstep pickup from your address.",
  },
  {
    category: "Fabric & Care",
    question: "How should I wash and care for pure linen sarees?",
    answer: "For the first few washes, dry cleaning is strongly recommended to preserve the yarn luster and zari work. For subsequent home washes, hand wash gently in cold water using a mild organic detergent. Never wring or tumble dry; dry in shade and iron while slightly damp on medium-high heat.",
  },
  {
    category: "Fabric & Care",
    question: "Why do handloom sarees have slight irregularities in texture?",
    answer: "Subtle slubs, minor knotting, and slight weave variations are the hallmark of authentic pit-loom weaving by human hands. They are proof of genuine handloom craftsmanship and distinguish hand-spun linen from mass-produced power-loom textiles.",
  },
];

const categories = ["All", "Contact & Account", "Products & Orders", "Shipping & Delivery", "Returns & Exchanges", "Fabric & Care"];

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openIndex, setOpenIndex] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = faqData.filter((item) => {
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory;
    const matchesSearch =
      !search.trim() ||
      item.question.toLowerCase().includes(search.toLowerCase()) ||
      item.answer.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero */}
        <div className="border-b border-pine-950/10 bg-linen py-16 sm:py-20">
          <div className="mx-auto max-w-[1240px] px-6 text-center lg:px-10">
            <span className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-pine-800">
              Help & Support
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-pine-950 sm:text-5xl">
              Frequently Asked Questions
            </h1>
            <p className="mx-auto mt-4 max-w-xl font-inter text-sm leading-relaxed text-muted sm:text-base">
              Find instant answers to common questions about our pure linen sarees, pit-loom craftsmanship, shipping, and returns.
            </p>

            {/* Search Input */}
            <div className="mx-auto mt-8 max-w-md">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search questions (e.g. wash care, delivery, COD)..."
                className="h-11 w-full rounded-md border border-hairline bg-white px-4 font-inter text-sm text-ink shadow-sm outline-none transition-colors focus:border-pine-900"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="mx-auto max-w-[900px] px-6 py-12 lg:px-10 lg:py-16">
          {/* Category Pills */}
          <div className="no-scrollbar flex gap-2 overflow-x-auto pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  setOpenIndex(null);
                }}
                className={`whitespace-nowrap rounded-full px-4 py-1.5 font-inter text-xs font-medium transition-colors cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-pine-900 text-white"
                    : "bg-linen text-pine-950 hover:bg-pine-950/10"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* FAQ Accordion List */}
          <div className="mt-8 space-y-3">
            {filtered.length === 0 ? (
              <p className="py-12 text-center text-sm text-muted">
                No questions found matching your search. Try different keywords or contact us directly on WhatsApp.
              </p>
            ) : (
              filtered.map((item, i) => {
                const isOpen = openIndex === i;
                return (
                  <div
                    key={item.question}
                    className="overflow-hidden rounded-xl border border-pine-950/10 bg-white transition-all shadow-[0_1px_2px_rgba(0,0,0,0.02)]"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="flex w-full cursor-pointer items-center justify-between p-5 text-left transition-colors hover:bg-linen/30"
                    >
                      <span className="font-display text-sm font-semibold text-pine-950 sm:text-base">
                        {item.question}
                      </span>
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className={`shrink-0 text-pine-800 transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <path d="m6 9 6 6 6-6" />
                      </svg>
                    </button>
                    {isOpen && (
                      <div className="border-t border-pine-950/5 bg-linen/20 px-5 pb-5 pt-3">
                        <p className="font-inter text-xs leading-relaxed text-muted sm:text-sm">
                          {item.answer}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Help Banner */}
          <div className="mt-14 rounded-2xl border border-pine-950/10 bg-linen p-6 text-center sm:p-8">
            <h3 className="font-display text-lg font-semibold text-pine-950 sm:text-xl">
              Still have questions?
            </h3>
            <p className="mt-2 text-xs text-muted sm:text-sm">
              Our artisan customer care team is available to assist with saree recommendations, styling advice, or custom order requests.
            </p>
            <a
              href="https://wa.me/919264151111"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-md bg-pine-900 px-6 py-2.5 font-inter text-xs font-semibold text-white transition-colors hover:bg-pine-950"
            >
              Chat on WhatsApp ↗
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

