import { Newspaper, Calendar, Download, ExternalLink } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Press & Media - Linen Sarees",
  description: "Latest news, press releases, and media resources from Linen Sarees. Contact our press team for media inquiries.",
}

export default function PressPage() {
  const pressReleases = [
    {
      date: "January 15, 2026",
      title: "Linen Sarees Launches New Sustainable Collection",
      excerpt: "Our latest collection features 100% organic materials and supports over 200 artisan families across India.",
      category: "Product Launch"
    },
    {
      date: "December 10, 2025", 
      title: "Partnership with Rural Weaver Cooperatives Expands",
      excerpt: "We're proud to announce partnerships with 15 new weaver cooperatives, bringing our total to 50+ communities.",
      category: "Partnership"
    },
    {
      date: "November 20, 2025",
      title: "Linen Sarees Wins Sustainable Fashion Award",
      excerpt: "Recognized for our commitment to ethical production and environmental responsibility in the textile industry.",
      category: "Award"
    },
    {
      date: "October 5, 2025",
      title: "International Expansion: Now Shipping to 25 Countries",
      excerpt: "Our handcrafted sarees are now available to customers across North America, Europe, and Australia.",
      category: "Expansion"
    }
  ]

  const mediaKit = [
    {
      title: "Brand Guidelines",
      description: "Logo usage, color palette, and brand voice guidelines",
      fileType: "PDF"
    },
    {
      title: "High-Resolution Images",
      description: "Product photos, lifestyle shots, and artisan portraits",
      fileType: "ZIP"
    },
    {
      title: "Company Fact Sheet",
      description: "Key statistics, milestones, and company information",
      fileType: "PDF"
    },
    {
      title: "Founder Biography",
      description: "Background and story of our founder",
      fileType: "PDF"
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Press & Media
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Latest news, press releases, and media resources from Linen Sarees
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {/* Press Contact */}
        <section className="mb-20 lg:mb-32">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8 lg:p-12">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="font-serif text-3xl font-light mb-6">Media Inquiries</h2>
                <p className="font-sans text-muted-foreground leading-relaxed mb-8">
                  For press inquiries, interview requests, or media partnerships, please contact our press team. We're always happy to share our story and connect with journalists interested in sustainable fashion and traditional craftsmanship.
                </p>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-sans font-medium mb-1">Press Contact</h3>
                    <p className="font-sans text-muted-foreground">press@linensaree.com</p>
                  </div>
                  <div>
                    <h3 className="font-sans font-medium mb-1">Phone</h3>
                    <p className="font-sans text-muted-foreground">+91-9264151111</p>
                  </div>
                  <div>
                    <h3 className="font-sans font-medium mb-1">Response Time</h3>
                    <p className="font-sans text-muted-foreground">Within 24 hours</p>
                  </div>
                </div>
              </div>
              <div className="bg-background rounded-xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Newspaper className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-serif text-xl font-medium">Quick Facts</h3>
                </div>
                <div className="space-y-4 font-sans text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Founded</span>
                    <span>2020</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Artisans Supported</span>
                    <span>500+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Countries Served</span>
                    <span>25+</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sustainability Focus</span>
                    <span>100% Ethical</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Press Releases */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">Recent Press Releases</h2>
          </div>

          <div className="space-y-8">
            {pressReleases.map((release, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-8 hover:bg-muted/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                      {release.category}
                    </span>
                    <span className="font-sans text-sm text-muted-foreground">
                      {release.date}
                    </span>
                  </div>
                  <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm font-medium">
                    Read Full Release
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
                <h3 className="font-serif text-xl lg:text-2xl font-medium mb-3">
                  {release.title}
                </h3>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {release.excerpt}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Media Kit */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Download className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">Media Kit</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {mediaKit.map((item, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-8">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-serif text-xl font-medium">{item.title}</h3>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded">
                    {item.fileType}
                  </span>
                </div>
                <p className="font-sans text-muted-foreground leading-relaxed mb-6">
                  {item.description}
                </p>
                <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
                  <Download className="w-4 h-4" />
                  Download
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Awards & Recognition */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Awards & Recognition
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We're honored to be recognized for our commitment to sustainable fashion and artisan empowerment
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                year: "2025",
                award: "Sustainable Fashion Award",
                organization: "Fashion Revolution India",
                description: "Recognized for ethical production practices"
              },
              {
                year: "2025",
                award: "Artisan Empowerment Award",
                organization: "Craft Council of India",
                description: "Supporting traditional weaving communities"
              },
              {
                year: "2024",
                award: "Best Online Saree Store",
                organization: "Indian Fashion Awards",
                description: "Excellence in customer service and quality"
              },
              {
                year: "2024",
                award: "Green Business Certification",
                organization: "Eco-Fashion Initiative",
                description: "Environmental responsibility in fashion"
              },
              {
                year: "2023",
                award: "Rising Star in Fashion",
                organization: "Textile Today",
                description: "Innovation in traditional textile retail"
              },
              {
                year: "2023",
                award: "Social Impact Award",
                organization: "Business for Good",
                description: "Positive impact on artisan communities"
              }
            ].map((award, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-6 text-center">
                <div className="font-serif text-2xl font-light text-primary mb-2">{award.year}</div>
                <h3 className="font-serif text-lg font-medium mb-2">{award.award}</h3>
                <p className="font-sans text-sm text-muted-foreground mb-3">{award.organization}</p>
                <p className="font-sans text-xs text-muted-foreground leading-relaxed">
                  {award.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Contact CTA */}
        <section className="mb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 lg:p-16 text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
              Let's Tell Our Story Together
            </h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              We're always excited to share our journey of preserving traditional craftsmanship while building a sustainable fashion future. Get in touch with our press team today.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:press@linensaree.com" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Contact Press Team
              </a>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-8 py-4 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
              >
                General Inquiries
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}