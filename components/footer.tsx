import Link from "next/link"
import { Instagram, Facebook, Twitter, Youtube } from "lucide-react"

const footerLinks = {
  shop: [
    { name: "New Arrivals", href: "#" },
    { name: "Handloom Sarees", href: "#" },
    { name: "Designer Collection", href: "#" },
    { name: "Bridal Wear", href: "#" },
    { name: "Festive Collection", href: "#" },
  ],
  about: [
    { name: "About Us", href: "/about" },
    { name: "Craftsmanship", href: "#" },
    { name: "Sustainability", href: "#" },
    { name: "Press", href: "#" },
    { name: "Careers", href: "#" },
  ],
  help: [
    { name: "Contact Us", href: "/contact" },
    { name: "FAQs", href: "/faq" },
    { name: "Shipping", href: "#" },
    { name: "Returns", href: "#" },
    { name: "Size Guide", href: "#" },
  ],
}

const socialLinks = [
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
]

export function Footer() {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-8">
        {/* Main Footer */}
        <div className="py-16 lg:py-20 grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-16">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <span className="font-serif text-2xl font-semibold">Linen Sarees</span>
            </Link>
            <p className="font-sans text-sm text-background/70 leading-relaxed mb-6 max-w-xs">
              Handcrafted elegance for the modern woman. Each saree tells a story of heritage and artistry.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <Link
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 border border-background/20 rounded-full flex items-center justify-center hover:bg-background hover:text-foreground transition-colors"
                  aria-label={social.name}
                >
                  <social.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <h3 className="font-sans text-sm tracking-wider uppercase mb-6">Shop</h3>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h3 className="font-sans text-sm tracking-wider uppercase mb-6">About</h3>
            <ul className="space-y-3">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="font-sans text-sm tracking-wider uppercase mb-6">Help</h3>
            <ul className="space-y-3">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="font-sans text-sm text-background/70 hover:text-background transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-sans text-xs text-background/50">
            © 2026 Linen Sarees. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="font-sans text-xs text-background/50 hover:text-background transition-colors">
              Privacy Policy
            </Link>
            <Link href="#" className="font-sans text-xs text-background/50 hover:text-background transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
