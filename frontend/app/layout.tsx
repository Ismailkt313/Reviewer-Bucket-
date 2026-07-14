import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import StructuredData from "./components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reviewer Bucket | Find Brocamp & Brototype Reviewers",
  description:
    "Search reviewer codes or names to quickly find Brocamp and Brototype reviewers. A simple, student-focused reviewer finder for Brocamp and Brototype review codes.",
  keywords: [
    "Reviewer Bucket",
    "Brocamp reviewer",
    "Brototype reviewer",
    "reviewer finder",
    "reviewer code",
    "find reviewer by code",
    "Brocamp review",
    "Brototype review",
  ],
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
  openGraph: {
    type: "website",
    title: "Reviewer Bucket | Find Brocamp & Brototype Reviewers",
    description:
      "Search reviewer codes or names to quickly find Brocamp and Brototype reviewers.",
    siteName: "Reviewer Bucket",
  },
  twitter: {
    card: "summary",
    title: "Reviewer Bucket | Find Brocamp & Brototype Reviewers",
    description:
      "Search reviewer codes or names to quickly find Brocamp and Brototype reviewers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col antialiased">
        {children}
        <StructuredData />
      </body>
    </html>
  );
}
