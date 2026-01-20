import { Shield, Eye, Cookie, Database, Users, Clock } from "lucide-react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy - Linen Sarees",
  description: "Learn how we collect, use, and protect your personal information. Your privacy is important to us.",
}

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-muted/50 to-background">
        <div className="max-w-[1400px] mx-auto px-4 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Privacy Policy
            </h1>
            <p className="font-sans text-lg lg:text-xl text-muted-foreground leading-relaxed">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 lg:px-8 py-16 lg:py-24">
        {/* Who We Are */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Who We Are</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed">
              Our website address is: <a href="https://linensaree.com" className="text-primary hover:underline">https://linensaree.com</a>
            </p>
          </div>
        </section>

        {/* Comments */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Eye className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Comments</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed mb-4">
              When visitors leave comments on the site we collect the data shown in the comments form, and also the visitor's IP address and browser user agent string to help spam detection.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              An anonymized string created from your email address (also called a hash) may be provided to the Gravatar service to see if you are using it. The Gravatar service privacy policy is available here: <a href="https://automattic.com/privacy/" className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">https://automattic.com/privacy/</a>. After approval of your comment, your profile picture is visible to the public in the context of your comment.
            </p>
          </div>
        </section>

        {/* Media */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Media</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed">
              If you upload images to the website, you should avoid uploading images with embedded location data (EXIF GPS) included. Visitors to the website can download and extract any location data from images on the website.
            </p>
          </div>
        </section>

        {/* Cookies */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Cookie className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Cookies</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8 space-y-4">
            <p className="font-sans text-muted-foreground leading-relaxed">
              If you leave a comment on our site you may opt-in to saving your name, email address and website in cookies. These are for your convenience so that you do not have to fill in your details again when you leave another comment. These cookies will last for one year.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select "Remember Me", your login will persist for two weeks. If you log out of your account, the login cookies will be removed.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              If you edit or publish an article, an additional cookie will be saved in your browser. This cookie includes no personal data and simply indicates the post ID of the article you just edited. It expires after 1 day.
            </p>
          </div>
        </section>
        {/* Embedded Content */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Embedded Content from Other Websites</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed mb-4">
              Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content, including tracking your interaction with the embedded content if you have an account and are logged in to that website.
            </p>
          </div>
        </section>

        {/* Data Sharing */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Who We Share Your Data With</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed">
              If you request a password reset, your IP address will be included in the reset email.
            </p>
          </div>
        </section>

        {/* Data Retention */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Clock className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">How Long We Retain Your Data</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8 space-y-4">
            <p className="font-sans text-muted-foreground leading-relaxed">
              If you leave a comment, the comment and its metadata are retained indefinitely. This is so we can recognize and approve any follow-up comments automatically instead of holding them in a moderation queue.
            </p>
            <p className="font-sans text-muted-foreground leading-relaxed">
              For users that register on our website (if any), we also store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.
            </p>
          </div>
        </section>

        {/* Your Rights */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">What Rights You Have Over Your Data</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed">
              If you have an account on this site, or have left comments, you can request to receive an exported file of the personal data we hold about you, including any data you have provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we are obliged to keep for administrative, legal, or security purposes.
            </p>
          </div>
        </section>

        {/* Data Transmission */}
        <section className="mb-16">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-primary" />
            </div>
            <h2 className="font-serif text-3xl font-light">Where Your Data Is Sent</h2>
          </div>
          <div className="bg-muted/30 rounded-2xl p-8">
            <p className="font-sans text-muted-foreground leading-relaxed">
              Visitor comments may be checked through an automated spam detection service.
            </p>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-16">
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-8">
            <h3 className="font-serif text-2xl font-light mb-4">Questions About This Policy?</h3>
            <p className="font-sans text-muted-foreground leading-relaxed mb-4">
              If you have any questions about this privacy policy or how we handle your data, please don't hesitate to contact us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                Contact Us
              </a>
              <a 
                href="mailto:linensaree001@gmail.com" 
                className="inline-flex items-center justify-center px-6 py-3 border border-primary text-primary rounded-lg hover:bg-primary/5 transition-colors font-medium"
              >
                Email Us
              </a>
            </div>
          </div>
        </section>

        {/* Last Updated */}
        <div className="text-center pt-8 border-t border-border">
          <p className="font-sans text-sm text-muted-foreground">
            Last updated: January 21, 2026
          </p>
        </div>
      </div>
    </div>
  )
}