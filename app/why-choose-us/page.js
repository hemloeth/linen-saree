import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Why Choose Us - Linen Saree",
  description: "Discover why discerning women across India trust Linen Saree for genuine handloom craftsmanship and pure linen drapes.",
};

export default function WhyChooseUsPage() {
  const pillars = [
    {
      icon: "🌿",
      title: "100% Certified Pure Natural Linen",
      description:
        "Every saree is woven from natural flax fibers. Breathable, hypoallergenic, and wonderfully airy—our sarees naturally regulate body temperature across all Indian seasons.",
    },
    {
      icon: "🧵",
      title: "Direct Pit-Loom Artisan Weaving",
      description:
        "We bypass industrial power-looms. Master weavers work on manual wooden pit looms, infusing generations of traditional expertise into every yard.",
    },
    {
      icon: "✨",
      title: "Contemporary Grace & Versatility",
      description:
        "Subtle pastels, rich temple borders, and minimalist zari motifs allow effortless styling—from executive morning meetings to intimate evening celebrations.",
    },
    {
      icon: "💎",
      title: "Fair Direct-from-Loom Pricing",
      description:
        "By cutting out distributor chains and high-rent showrooms, we deliver heirloom handloom luxury at fair, transparent pricing that directly empowers weaving families.",
    },
    {
      icon: "🚚",
      title: "Reliable PAN-India Express Delivery",
      description:
        "Carefully folded, packed in protective muslin covers, and dispatched with trusted courier partners. Complimentary free shipping on prepaid orders above ₹999.",
    },
    {
      icon: "🛡️",
      title: "7-Day Stress-Free Return Guarantee",
      description:
        "Shop with complete confidence. If your saree does not meet your expectations, our easy 7-day return policy ensures immediate replacement or prompt refund.",
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero */}
        <div className="border-b border-pine-950/10 bg-linen py-16 sm:py-24">
          <div className="mx-auto max-w-[1240px] px-6 text-center lg:px-10">
            <span className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-pine-800">
              Our Commitment
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-pine-950 sm:text-5xl">
              Why Choose Linen Saree
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-inter text-sm leading-relaxed text-muted sm:text-base">
              The purity of natural flax, the soul of Indian pit looms, and an uncompromising dedication to heirloom quality.
            </p>
          </div>
        </div>

        {/* Pillars Grid */}
        <div className="mx-auto max-w-[1100px] px-6 py-16 lg:px-10 lg:py-24">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pillars.map((pillar) => (
              <div
                key={pillar.title}
                className="rounded-2xl border border-pine-950/10 bg-white p-7 shadow-sm transition-all hover:-translate-y-1 hover:border-pine-900/30 hover:shadow-md"
              >
                <span className="text-3xl" aria-hidden="true">{pillar.icon}</span>
                <h2 className="mt-4 font-display text-lg font-semibold text-pine-950">
                  {pillar.title}
                </h2>
                <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>

          {/* Sourcing Promise */}
          <div className="mt-16 rounded-2xl border border-pine-950/10 bg-linen p-8 text-center sm:p-12">
            <h2 className="font-display text-2xl font-semibold text-pine-950 sm:text-3xl">
              From Master Weavers To Your Wardrobe
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-inter text-sm leading-relaxed text-muted">
              Every order placed on Linen Saree supports traditional handloom artisan households across India, helping preserve a centuries-old cultural heritage.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <a
                href="/collections"
                className="rounded-md bg-pine-900 px-6 py-3 font-inter text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-pine-950"
              >
                Explore Collections
              </a>
              <a
                href="/about"
                className="rounded-md border border-pine-950/20 bg-white px-6 py-3 font-inter text-xs font-semibold uppercase tracking-wider text-pine-950 transition-colors hover:bg-linen"
              >
                Our Weaving Story
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

