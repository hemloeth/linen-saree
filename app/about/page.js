import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata = {
  title: "Our Story - Linen Saree",
  description: "Learn about our mission to support weavers and bring you the finest handcrafted sarees from across India.",
};

export default function AboutPage() {
  const fabrics = [
    {
      title: "Pure Linen",
      description: "Breathable and elegant linen sarees crafted from natural flax fibres, perfect for all climates.",
    },
    {
      title: "Dupion Silk",
      description: "Lustrous dupion silk with rich texture, crisp structure, and natural royal sheen.",
    },
    {
      title: "Munga Silk",
      description: "Traditional heritage silk known for its strength, glossy texture, and enduring grace.",
    },
    {
      title: "Banarasi Silk",
      description: "Handwoven masterpieces woven with intricate zari work by master artisans.",
    },
    {
      title: "Bhagalpuri Silk",
      description: "Fine silk from Bihar celebrated for its distinctive weave patterns and earthy hues.",
    },
    {
      title: "Handloom Cotton & Silk",
      description: "Authentic handloom creations directly empowering traditional pit-loom weaving communities.",
    },
  ];

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        {/* Hero Section */}
        <div className="border-b border-pine-950/10 bg-linen py-16 sm:py-24">
          <div className="mx-auto max-w-[1240px] px-6 text-center lg:px-10">
            <span className="font-inter text-xs font-semibold uppercase tracking-[0.2em] text-pine-800">
              Heritage & Craft
            </span>
            <h1 className="mt-3 font-display text-3xl font-semibold uppercase tracking-wide text-pine-950 sm:text-5xl">
              About Linen Saree
            </h1>
            <p className="mx-auto mt-4 max-w-2xl font-inter text-sm leading-relaxed text-muted sm:text-base">
              Bringing the authentic grace of handloom pit looms directly into contemporary wardrobes across the globe.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="mx-auto max-w-[1240px] px-6 py-16 lg:px-10 lg:py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="font-inter text-xs font-semibold uppercase tracking-wider text-pine-800">
                Our Mission
              </span>
              <h2 className="mt-2 font-display text-2xl font-semibold text-pine-950 sm:text-3xl">
                Honoring Hands That Weave Heritage
              </h2>
              <div className="mt-6 space-y-4 font-inter text-sm leading-relaxed text-muted">
                <p>
                  At <strong className="text-pine-950">Linen Saree</strong>, we aim to deliver that unmatched feeling of elegance and pride in every drape. Our journey begins at the heart of India&apos;s weaving belts, where master weavers have preserved sacred textile techniques across generations.
                </p>
                <p>
                  We partner directly with handloom artisan clusters across Bihar, Bengal, Varanasi, and Tamil Nadu. By eliminating layers of intermediaries, we ensure fair livelihood to craftspeople while offering discerning wearers pure, certified handwoven treasures at fair pricing.
                </p>
              </div>
            </div>

            <div>
              <span className="font-inter text-xs font-semibold uppercase tracking-wider text-pine-800">
                The Timeless Drapes
              </span>
              <h2 className="mt-2 font-display text-2xl font-semibold text-pine-950 sm:text-3xl">
                The Incomparable Charm of Linen
              </h2>
              <div className="mt-6 space-y-4 font-inter text-sm leading-relaxed text-muted">
                <p>
                  A saree is far more than six yards of fabric — it is living art that flatters every silhouette and breathes with quiet confidence. Pure linen adds an effortless, lightweight texture that stays breezy under the sun yet formal for evening soirees.
                </p>
                <p>
                  Every piece in our collection is carefully inspected, yarn by yarn, for purity and softness so you receive an heirloom saree that only gets softer with each wash and year.
                </p>
              </div>
            </div>
          </div>

          {/* Collection Highlights */}
          <div className="mt-20 border-t border-pine-950/10 pt-16">
            <div className="text-center">
              <span className="font-inter text-xs font-semibold uppercase tracking-wider text-pine-800">
                Pure Weaves
              </span>
              <h2 className="mt-2 font-display text-2xl font-semibold uppercase tracking-wide text-pine-950 sm:text-3xl">
                Our Textile Repertoire
              </h2>
            </div>

            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {fabrics.map((fabric) => (
                <div
                  key={fabric.title}
                  className="rounded-xl border border-pine-950/10 bg-linen/50 p-6 transition-all hover:bg-linen"
                >
                  <h3 className="font-display text-lg font-semibold text-pine-950">
                    {fabric.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-muted sm:text-sm">
                    {fabric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

