import { Briefcase, Heart, Users, Globe, Award, ArrowRight } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Careers - Linen Sarees",
  description: "Join our team and help preserve traditional craftsmanship while building a sustainable fashion future. View open positions.",
}

export default function CareersPage() {
  const openPositions = [
    {
      title: "Digital Marketing Specialist",
      department: "Marketing",
      location: "Remote / Bhagalpur",
      type: "Full-time",
      description: "Help us share our story of sustainable fashion and traditional craftsmanship with the world."
    },
    {
      title: "Customer Experience Manager",
      department: "Customer Service",
      location: "Bhagalpur, Bihar",
      type: "Full-time", 
      description: "Lead our customer service team to deliver exceptional experiences for our saree enthusiasts."
    },
    {
      title: "Artisan Relationship Coordinator",
      department: "Operations",
      location: "Field-based / Bihar",
      type: "Full-time",
      description: "Build and maintain relationships with our weaver communities across India."
    },
    {
      title: "Quality Assurance Specialist",
      department: "Operations",
      location: "Bhagalpur, Bihar",
      type: "Full-time",
      description: "Ensure every saree meets our exacting standards of quality and craftsmanship."
    }
  ]

  const benefits = [
    {
      title: "Meaningful Work",
      description: "Be part of preserving traditional crafts while building sustainable fashion",
      icon: <Heart className="w-6 h-6 text-primary" />
    },
    {
      title: "Growth Opportunities",
      description: "Continuous learning and career development in a growing company",
      icon: <Award className="w-6 h-6 text-primary" />
    },
    {
      title: "Flexible Work",
      description: "Remote work options and flexible schedules for work-life balance",
      icon: <Globe className="w-6 h-6 text-primary" />
    },
    {
      title: "Team Culture",
      description: "Collaborative environment with passionate, like-minded colleagues",
      icon: <Users className="w-6 h-6 text-primary" />
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Join Our Team
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Help us weave a better future for fashion, artisans, and the planet
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {/* Our Mission */}
        <section className="mb-20 lg:mb-32">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <div>
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Heart className="w-6 h-6 text-primary" />
                </div>
                <h2 className="font-serif text-3xl lg:text-4xl font-light">Why Work With Us</h2>
              </div>
              <div className="space-y-6 font-sans text-muted-foreground leading-relaxed">
                <p>
                  At Linen Sarees, we're not just building a business – we're preserving a heritage, supporting communities, and creating a more sustainable future for fashion.
                </p>
                <p>
                  Every team member plays a crucial role in our mission to bring authentic, handcrafted sarees to the world while empowering the artisans who create them.
                </p>
                <p>
                  Join us in making a meaningful impact that goes beyond profit, touching the lives of weavers, customers, and communities across India.
                </p>
              </div>
            </div>
            <div className="bg-muted/30 rounded-2xl p-8 lg:p-12">
              <h3 className="font-serif text-2xl font-light mb-6">Our Values</h3>
              <div className="space-y-4">
                <div>
                  <h4 className="font-sans font-medium mb-2">Authenticity</h4>
                  <p className="font-sans text-muted-foreground text-sm">
                    We stay true to traditional craftsmanship and honest business practices
                  </p>
                </div>
                <div>
                  <h4 className="font-sans font-medium mb-2">Sustainability</h4>
                  <p className="font-sans text-muted-foreground text-sm">
                    Environmental and social responsibility guide every decision
                  </p>
                </div>
                <div>
                  <h4 className="font-sans font-medium mb-2">Empowerment</h4>
                  <p className="font-sans text-muted-foreground text-sm">
                    We believe in lifting up artisan communities and our team members
                  </p>
                </div>
                <div>
                  <h4 className="font-sans font-medium mb-2">Excellence</h4>
                  <p className="font-sans text-muted-foreground text-sm">
                    Quality and craftsmanship are at the heart of everything we do
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Why You'll Love Working Here
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We believe in taking care of our team so they can take care of our mission
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    {benefit.icon}
                  </div>
                  <h3 className="font-serif text-xl font-medium">{benefit.title}</h3>
                </div>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Open Positions */}
        <section className="mb-20 lg:mb-32">
          <div className="flex items-center gap-4 mb-12">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl lg:text-4xl font-light">Open Positions</h2>
          </div>

          <div className="space-y-6">
            {openPositions.map((position, index) => (
              <div key={index} className="bg-muted/30 rounded-2xl p-8 hover:bg-muted/40 transition-colors">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-serif text-xl lg:text-2xl font-medium mb-2">
                      {position.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {position.department}
                      </span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-4 h-4" />
                        {position.location}
                      </span>
                      <span className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-medium">
                        {position.type}
                      </span>
                    </div>
                  </div>
                  <button className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
                    Apply Now
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
                <p className="font-sans text-muted-foreground leading-relaxed">
                  {position.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Application Process */}
        <section className="mb-20 lg:mb-32">
          <div className="text-center mb-16">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-6">
              Our Hiring Process
            </h2>
            <p className="font-sans text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We believe in a transparent, respectful hiring process that helps us find the right fit
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: "01",
                title: "Application",
                description: "Submit your resume and cover letter through our careers page"
              },
              {
                step: "02",
                title: "Initial Review",
                description: "Our team reviews your application and responds within 5 business days"
              },
              {
                step: "03",
                title: "Interview",
                description: "Video or in-person interview to discuss your experience and our mission"
              },
              {
                step: "04",
                title: "Decision",
                description: "We'll make a decision and get back to you within a week of the interview"
              }
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="font-serif text-xl font-light text-primary">{step.step}</span>
                </div>
                <h3 className="font-serif text-lg font-medium mb-3">{step.title}</h3>
                <p className="font-sans text-muted-foreground text-sm leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Don't See a Fit */}
        <section className="mb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-12 lg:p-16 text-center">
            <h2 className="font-serif text-3xl lg:text-4xl font-light mb-8">
              Don't See the Perfect Role?
            </h2>
            <p className="font-sans text-muted-foreground leading-relaxed mb-8 max-w-2xl mx-auto">
              We're always looking for passionate people who share our values. Send us your resume and tell us how you'd like to contribute to our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="mailto:careers@linensaree.com" 
                className="inline-flex items-center justify-center px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Send Your Resume
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