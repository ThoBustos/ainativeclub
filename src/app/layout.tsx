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
  title: "AI Native Club | For builders, not watchers",
  description:
    "The club for AI-native founders and builders scaling 0→10M. Join 847+ founders who ship the AI-native way.",
  icons: {
    icon: "/favicon.svg",
    apple: "/favicon.svg",
  },
  openGraph: {
    title: "AI Native Club",
    description: "The club for AI-native builders. Join 847+ founders scaling 0→10M with AI at the core.",
    type: "website",
    url: "https://ainativeclub.com",
    siteName: "AI Native Club",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "AI Native Club - The club for AI-native builders",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Native Club",
    description: "The club for AI-native builders. Join 847+ founders scaling 0→10M.",
    images: ["/og-image.svg"],
  },
  metadataBase: new URL("https://ainativeclub.com"),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
