import { Metadata } from "next"

export const metadata: Metadata = {
  title: "About Us - Linen Sarees",
  description: "Learn about our mission to support weavers and bring you the finest handcrafted sarees from across India.",
}

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              About Linen Sarees
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Bringing that wow moment to every individual associated with our brand
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-start">
          {/* Our Mission */}
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
              Our Mission
            </h2>
            <div className="space-y-6 font-sans text-muted-foreground leading-relaxed">
              <p>
                At linensaree.com, we aim to give that <strong>wow!</strong> moment to each and every individual associated with our brand. Our mission goes beyond just selling beautiful sarees – we're committed to empowering the artisans who create them.
              </p>
              <p>
                We work directly with weavers across the country who don't have access to the retail market. By collecting their exquisite products and bringing them to you, we create a bridge between traditional craftsmanship and modern consumers.
              </p>
            </div>
          </div>

          {/* The Beauty of Sarees */}
          <div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
              The Beauty of Sarees
            </h2>
            <div className="space-y-6 font-sans text-muted-foreground leading-relaxed">
              <p>
                Sarees always bring out the best features in a woman, making them look absolutely stunning irrespective of age. There is no other ethnic wear that can be styled in so many ways like the saree.
              </p>
              <p>
                The beauty of this timeless garment goes several notches above when crafted with high-quality materials. That's why we've curated an expansive range of sarees made with premium fabrics.
              </p>
            </div>
          </div>
        </div>

        {/* Our Collection */}
        <div className="mt-20 lg:mt-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Our Exquisite Collection
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Made in exquisite designs, patterns, and colors, our sarees are a class apart from the rest
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Premium Linen",
                description: "Breathable and elegant linen sarees perfect for any occasion"
              },
              {
                title: "Dupion Silk",
                description: "Lustrous dupion silk with rich texture and natural sheen"
              },
              {
                title: "Munga Silk",
                description: "Traditional Assamese silk known for its durability and beauty"
              },
              {
                title: "Banarasi Silk",
                description: "Handwoven masterpieces from the silk city of Varanasi"
              },
              {
                title: "Bhagalpuri Silk",
                description: "Fine silk from Bihar with intricate patterns and designs"
              },
              {
                title: "Handloom Cotton & Silk",
                description: "Authentic handloom creations supporting traditional weavers"
              }
            ].map((fabric, index) => (
              <div key={index} className="bg-muted/30 p-8 rounded-lg">
                <h3 className="font-serif text-xl font-medium mb-4">{fabric.title}</h3>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {fabric.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Our Promise */}
        <div className="mt-20 lg:mt-32 bg-muted/30 rounded-2xl p-12 lg:p-16 text-center">
          <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
            Our Promise to You
          </h2>
          <div className="max-w-4xl mx-auto space-y-6 font-sans text-muted-foreground leading-relaxed">
            <p className="text-lg">
              When you shop at linensaree.com, you're not just buying a saree – you're supporting traditional artisans and getting the finest Indian wear for women at very reasonable prices.
            </p>
            <p>
              We believe in making authentic, high-quality sarees accessible to every woman who appreciates the timeless elegance of this beautiful garment.
            </p>
          </div>
          <div className="mt-12">
            <p className="font-serif text-xl font-medium">
              Best Regards,<br />
              <span className="text-primary">The Linen Saree Team</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}