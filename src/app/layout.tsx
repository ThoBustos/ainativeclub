import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Native Club | The club for AI-native builders",
  description:
    "Advisory + community for technical co-founders building AI-native companies. 50K-2M ARR. We build roadmaps, ship product, hire teams, close deals. With AI.",
  keywords: [
    "AI native",
    "AI founders",
    "technical co-founder",
    "startup community",
    "AI advisory",
    "founder community",
    "AI-first",
    "startup scaling",
  ],
  authors: [{ name: "Thomas Bustos", url: "https://thomasbustos.com" }],
  creator: "Thomas Bustos",
  publisher: "AI Native Club",
  manifest: "/manifest.json",
  openGraph: {
    title: "AI Native Club",
    description:
      "Advisory + community for technical co-founders building AI-native companies. 50K-2M ARR.",
    type: "website",
    url: "https://ainativeclub.com",
    siteName: "AI Native Club",
    locale: "en_US",
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Native Club",
    description:
      "Advisory + community for technical co-founders. 50K-2M ARR. Ship with AI.",
    creator: "@ThoBustos",
    images: ["/opengraph-image"],
  },
  metadataBase: new URL("https://ainativeclub.com"),
  alternates: {
    canonical: "https://ainativeclub.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

// JSON-LD Structured Data
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "AI Native Club",
  description:
    "Advisory + community for technical co-founders building AI-native companies.",
  url: "https://ainativeclub.com",
  logo: "https://ainativeclub.com/favicon.svg",
  founder: {
    "@type": "Person",
    name: "Thomas Bustos",
    url: "https://linkedin.com/in/thomasbustos",
  },
  sameAs: [
    "https://twitter.com/ThoBustos",
    "https://linkedin.com/in/thomasbustos",
    "https://youtube.com/@lets-talk-ai",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
