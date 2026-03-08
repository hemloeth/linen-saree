import { Scissors, Heart, Users, Award, Clock, MapPin } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Craftsmanship - Linen Sarees",
  description: "Discover the heritage and artistry behind our handcrafted sarees. Learn about traditional weaving techniques and skilled artisans.",
}

export default function CraftsmanshipPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Our Craftsmanship
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Every thread tells a story of heritage, skill, and timeless artistry
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {/* Heritage of Handloom */}
        <section className="mb-20 lg:mb-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Scissors className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl lg:text-4xl font-light">Heritage of Handloom</h2>
              </div>
              <div className="space-y-6 font-sans text-muted-foreground leading-relaxed">
                <p>
                  For centuries, the art of handloom weaving has been passed down through generations of skilled artisans across India. Each saree in our collection represents this rich heritage, woven with techniques that have remained unchanged for hundreds of years.
                </p>
                <p>
                  Our craftsmen don't just create sarees; they preserve a living tradition that connects the modern woman to the timeless elegance of Indian culture.
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <Clock className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-2">Time-Honored Techniques</h3>
                    <p className="font-sans text-muted-foreground text-sm">
                      Traditional methods passed down through generations
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Users className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-2">Master Artisans</h3>
                    <p className="font-sans text-muted-foreground text-sm">
                      Skilled weavers with decades of experience
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Heart className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-serif text-xl font-medium mb-2">Passion & Dedication</h3>
                    <p className="font-sans text-muted-foreground text-sm">
                      Every piece crafted with love and attention to detail
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* The Weaving Process */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              The Weaving Process
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              From selecting the finest threads to the final finishing touches, every step is a testament to our commitment to excellence
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Thread Selection",
                description: "Only the finest quality threads are chosen, sourced from trusted suppliers who share our commitment to excellence."
              },
              {
                step: "02", 
                title: "Design Planning",
                description: "Each pattern is carefully planned and mapped out, ensuring perfect symmetry and balance in the final design."
              },
              {
                step: "03",
                title: "Loom Preparation",
                description: "The handloom is meticulously set up with threads arranged according to the specific pattern requirements."
              },
              {
                step: "04",
                title: "Weaving",
                description: "Master weavers work with precision and patience, creating intricate patterns one thread at a time."
              },
              {
                step: "05",
                title: "Quality Check",
                description: "Every saree undergoes rigorous quality inspection to ensure it meets our exacting standards."
              },
              {
                step: "06",
                title: "Finishing",
                description: "Final touches including border attachment, tassels, and pressing complete the masterpiece."
              }
            ].map((process, index) => (
              <div key={index} className="bg-muted/30 p-8 rounded-lg">
                <div className="text-primary font-serif text-2xl font-light mb-4">{process.step}</div>
                <h3 className="font-serif text-xl font-medium mb-4">{process.title}</h3>
                <p className="font-sans text-muted-foreground leading-relaxed text-sm">
                  {process.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Regional Specialties */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Regional Specialties
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Each region of India brings its unique style and technique to our collection
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {[
              {
                region: "Varanasi, Uttar Pradesh",
                specialty: "Banarasi Silk",
                description: "Known for their intricate brocade work and gold thread embellishments, Banarasi sarees represent the pinnacle of Indian silk weaving.",
                icon: <Award className="w-8 h-8 text-primary" />
              },
              {
                region: "Bhagalpur, Bihar", 
                specialty: "Tussar Silk",
                description: "Famous for their natural golden sheen and texture, Bhagalpuri silks are woven with traditional techniques passed down through generations.",
                icon: <MapPin className="w-8 h-8 text-primary" />
              },
              {
                region: "Assam",
                specialty: "Muga Silk",
                description: "The golden silk of Assam, known for its durability and natural luster, represents one of India's most precious textile traditions.",
                icon: <Heart className="w-8 h-8 text-primary" />
              },
              {
                region: "West Bengal",
                specialty: "Handloom Cotton",
                description: "Traditional cotton weaving techniques create breathable, comfortable sarees perfect for daily wear while maintaining elegance.",
                icon: <Users className="w-8 h-8 text-primary" />
              }
            ].map((region, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  {region.icon}
                  <div>
                    <h3 className="font-serif text-xl font-medium">{region.specialty}</h3>
                    <p className="font-sans text-sm text-muted-foreground">{region.region}</p>
                  </div>
                </div>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {region.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Our Commitment */}
        <section className="mb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 lg:p-16 text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
              Our Commitment to Excellence
            </h2>
            <div className="max-w-4xl mx-auto space-y-6 font-sans text-muted-foreground leading-relaxed">
              <p className="text-lg">
                Every saree that bears the Linen Sarees name is a testament to our unwavering commitment to quality, authenticity, and the preservation of traditional craftsmanship.
              </p>
              <p>
                We work directly with artisan communities, ensuring fair compensation and supporting the continuation of these precious skills for future generations.
              </p>
              <p>
                When you choose a saree from our collection, you're not just buying a garment – you're becoming part of a story that spans centuries and supports the livelihoods of skilled craftspeople across India.
              </p>
            </div>
            <div className="mt-12">
              <a 
                href="/collections" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Explore Our Collection
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}