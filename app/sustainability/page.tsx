import { Leaf, Recycle, Users, Heart, Globe, Droplets } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Sustainability - Linen Sarees",
  description: "Learn about our commitment to sustainable fashion, ethical production, and supporting artisan communities across India.",
}

export default function SustainabilityPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Sustainability
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Weaving a better future through ethical practices and environmental responsibility
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {/* Our Commitment */}
        <section className="mb-20 lg:mb-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Leaf className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl lg:text-4xl font-light">Our Green Commitment</h2>
              </div>
              <div className="space-y-6 font-sans text-muted-foreground leading-relaxed">
                <p>
                  At Linen Sarees, sustainability isn't just a buzzword – it's woven into the very fabric of our business. We believe that beautiful fashion should never come at the cost of our planet or the people who create it.
                </p>
                <p>
                  Our commitment extends from the selection of eco-friendly materials to supporting traditional artisans who use time-honored, sustainable techniques passed down through generations.
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Globe className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-2">Environmental Impact</h3>
                    <p className="font-sans text-muted-foreground text-sm">
                      Minimizing our carbon footprint through sustainable practices
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-2">Social Responsibility</h3>
                    <p className="font-sans text-muted-foreground text-sm">
                      Supporting artisan communities and fair trade practices
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-2">Ethical Production</h3>
                    <p className="font-sans text-muted-foreground text-sm">
                      Ensuring fair wages and safe working conditions
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Sustainable Materials */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Sustainable Materials
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We carefully select materials that are both beautiful and environmentally responsible
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                material: "Organic Cotton",
                description: "Grown without harmful pesticides or chemicals, our organic cotton is gentle on both skin and environment.",
                icon: <Leaf className="w-8 h-8 text-primary" />
              },
              {
                material: "Natural Linen",
                description: "Made from flax plants, linen is biodegradable and requires minimal water and chemicals to produce.",
                icon: <Droplets className="w-8 h-8 text-primary" />
              },
              {
                material: "Peace Silk",
                description: "Ethically sourced silk that allows silkworms to complete their natural lifecycle.",
                icon: <Heart className="w-8 h-8 text-primary" />
              },
              {
                material: "Natural Dyes",
                description: "Traditional plant-based dyes that are non-toxic and biodegradable.",
                icon: <Recycle className="w-8 h-8 text-primary" />
              },
              {
                material: "Handspun Yarn",
                description: "Traditional spinning methods that consume no electricity and support local communities.",
                icon: <Users className="w-8 h-8 text-primary" />
              },
              {
                material: "Recycled Fibers",
                description: "Giving new life to textile waste through innovative recycling processes.",
                icon: <Globe className="w-8 h-8 text-primary" />
              }
            ].map((item, index) => (
              <div key={index} className="bg-muted/30 p-8 rounded-lg text-center">
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="font-serif text-xl font-medium mb-4">{item.material}</h3>
                <p className="font-sans text-muted-foreground leading-relaxed text-sm">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Artisan Support */}
        <section className="mb-20 lg:mb-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
              <h3 className="font-serif text-2xl font-light mb-6">Supporting Artisan Communities</h3>
              <div className="space-y-4 font-sans text-muted-foreground leading-relaxed">
                <p>
                  We work directly with weaver cooperatives and individual artisans across India, ensuring they receive fair compensation for their exceptional skills.
                </p>
                <p>
                  Our partnerships provide stable income, preserve traditional techniques, and support entire communities that depend on textile crafts.
                </p>
              </div>
              <div className="mt-8 grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="font-serif text-2xl font-light text-primary mb-2">500+</div>
                  <div className="font-sans text-sm text-muted-foreground">Artisans Supported</div>
                </div>
                <div className="text-center">
                  <div className="font-serif text-2xl font-light text-primary mb-2">50+</div>
                  <div className="font-sans text-sm text-muted-foreground">Villages Reached</div>
                </div>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl lg:text-4xl font-light">Empowering Communities</h2>
              </div>
              <div className="space-y-6 font-sans text-muted-foreground leading-relaxed">
                <p>
                  Every purchase you make directly impacts the lives of skilled artisans and their families. We believe in creating a sustainable ecosystem where traditional crafts can thrive in the modern world.
                </p>
                <p>
                  Through fair trade practices, skill development programs, and long-term partnerships, we're helping preserve India's rich textile heritage while providing economic opportunities.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Environmental Initiatives */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Environmental Initiatives
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our ongoing efforts to minimize environmental impact and promote sustainable practices
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
            {[
              {
                title: "Water Conservation",
                description: "We partner with artisans who use traditional dyeing methods that require minimal water and avoid harmful chemicals.",
                icon: <Droplets className="w-6 h-6 text-primary" />
              },
              {
                title: "Waste Reduction",
                description: "Our zero-waste approach ensures that fabric scraps are repurposed into accessories and smaller items.",
                icon: <Recycle className="w-6 h-6 text-primary" />
              },
              {
                title: "Carbon Footprint",
                description: "We minimize transportation emissions by sourcing locally and using eco-friendly packaging materials.",
                icon: <Globe className="w-6 h-6 text-primary" />
              },
              {
                title: "Biodegradable Packaging",
                description: "All our packaging materials are either recyclable or biodegradable, reducing environmental impact.",
                icon: <Leaf className="w-6 h-6 text-primary" />
              }
            ].map((initiative, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {initiative.icon}
                  </div>
                  <h3 className="font-serif text-xl font-medium">{initiative.title}</h3>
                </div>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {initiative.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Promise */}
        <section className="mb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 lg:p-16 text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
              Our Sustainability Promise
            </h2>
            <div className="max-w-4xl mx-auto space-y-6 font-sans text-muted-foreground leading-relaxed">
              <p className="text-lg">
                We pledge to continuously improve our sustainability practices, always seeking new ways to reduce our environmental impact while supporting the communities that make our beautiful sarees possible.
              </p>
              <p>
                Every saree you purchase is a vote for sustainable fashion, ethical production, and the preservation of traditional crafts for future generations.
              </p>
            </div>
            <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="/collections" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Shop Sustainably
              </a>
              <a 
                href="/about" 
                className="inline-flex items-center justify-center px-8 py-4 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
              >
                Learn More About Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}