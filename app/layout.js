import { Cinzel, Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import StoreProvider from "@/components/StoreProvider";
import WhatsAppFloat from "@/components/WhatsAppFloat";
import JsonLd from "@/components/JsonLd";
import TopProgressBar from "@/components/TopProgressBar";
import ScrollRestorer from "@/components/ScrollRestorer";

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Linen Saree",
  url: "https://linensaree.com",
  logo: "https://linensaree.com/images/logo-mark.png",
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91-92641-51111",
    contactType: "customer service",
    areaServed: "IN",
    availableLanguage: ["English", "Hindi"],
  },
  sameAs: [
    "https://www.instagram.com/_linensaree/",
    "https://www.facebook.com/people/Linensareecom/100063776541814/",
    "https://www.youtube.com/@linensaree",
  ],
};

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata = {
  title: {
    default: "Linen Saree | Handcrafted Pure Linen Sarees",
    template: "%s | Linen Saree",
  },
  description:
    "Authentic handwoven pure linen sarees crafted by master artisans directly on traditional pit looms, delivered PAN India.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${cinzel.variable} ${inter.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-white overflow-x-hidden w-full max-w-full"
      >
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <Suspense fallback={null}>
          <ScrollRestorer />
        </Suspense>
        <StoreProvider>
          {children}
          <WhatsAppFloat />
        </StoreProvider>
        <JsonLd id="organization-schema-jsonld" data={organizationSchema} />
      </body>
    </html>
  );
}
