import type { Metadata } from "next";
import { Inter, Outfit, Montserrat, Oswald } from "next/font/google";
import "./globals.css";
import { DirectoryFooter } from "@/components/DirectoryFooter";
import { RuntimeShell } from "@/components/RuntimeShell";
import { buildOgImageUrl } from "@/lib/og-image";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  display: "swap",
});

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "optional",
  weight: ["400", "600", "700", "800", "900"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "700"],
});

const defaultOgImage = buildOgImageUrl({
  template: "home",
  title: "Australia's verified trade referral marketplace",
  subtitle: "Find ABN-verified tradespeople, compare local options and earn rewards for trusted referrals.",
  eyebrow: "TradeRefer",
  badge: "Verified network",
  stat1: "ABN-checked",
  stat2: "Local referrals",
  stat3: "Free quotes",
});

export const metadata: Metadata = {
  title: "TradeRefer | Australia's Verified Trade Referral Marketplace",
  description: "Find ABN-verified tradespeople near you. Compare reviews, get free quotes, and earn 70% commission by referring. Australia's trusted trade referral marketplace.",
  openGraph: {
    title: "TradeRefer | Australia's Verified Trade Referral Marketplace",
    description: "Find ABN-verified tradespeople near you. Compare reviews, get free quotes, and earn by referring. Australia's trusted trade referral marketplace.",
    url: "https://traderefer.au",
    siteName: "TradeRefer",
    type: "website",
    images: [{ url: defaultOgImage, width: 1200, height: 630, alt: "TradeRefer - Australia's Verified Trade Referral Marketplace" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "TradeRefer | Australia's Verified Trade Referral Marketplace",
    description: "Find ABN-verified tradespeople near you. Earn 70% commission by referring. Australia's trusted trade referral marketplace.",
    images: [defaultOgImage],
  },
  alternates: { canonical: "https://traderefer.au" },
  other: {
    "geo.region": "AU",
    "geo.placename": "Australia",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "TradeRefer",
  "url": "https://traderefer.au",
  "logo": "https://traderefer.au/logo.png",
  "description": "Australia's verified trade referral marketplace. Find ABN-verified tradespeople, refer businesses, and earn commission.",
  "sameAs": ["https://www.facebook.com/traderefer", "https://www.instagram.com/traderefer"]
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "TradeRefer",
  "url": "https://traderefer.au",
  "potentialAction": {
    "@type": "SearchAction",
    "target": { "@type": "EntryPoint", "urlTemplate": "https://traderefer.au/businesses?q={search_term_string}" },
    "query-input": "required name=search_term_string"
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-AU" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${outfit.variable} ${montserrat.variable} ${oswald.variable} font-sans antialiased`}
      >
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }} />
        <RuntimeShell footer={<DirectoryFooter />}>
          {children}
        </RuntimeShell>
      </body>
    </html>
  );
}
