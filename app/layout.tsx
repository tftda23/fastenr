import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"

import { ThemeProvider } from "@/components/ui/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import ErrorBoundary from "@/components/ui/error-boundary"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
})
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
})

export const metadata: Metadata = {
  title: {
    default: "Fastenr - Customer Success Platform",
    template: "%s | Fastenr"
  },
  description: "Transform your customer relationships with Fastenr's comprehensive customer success platform. Track health scores, manage engagements, reduce churn, and drive growth.",
  keywords: [
    "customer success",
    "customer health",
    "churn reduction",
    "customer engagement",
    "SaaS analytics",
    "customer retention",
    "account management",
    "customer experience"
  ],
  authors: [{ name: "Fastenr Team" }],
  creator: "Fastenr",
  publisher: "Fastenr",
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
    locale: "en_US",
    url: "https://fastenr.com",
    siteName: "Fastenr",
    title: "Fastenr - Customer Success Platform",
    description: "Transform your customer relationships with Fastenr's comprehensive customer success platform.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Fastenr Customer Success Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Fastenr - Customer Success Platform",
    description: "Transform your customer relationships with Fastenr's comprehensive customer success platform.",
    images: ["/og-image.jpg"],
    creator: "@fastenr",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://fastenr.com"),
  alternates: {
    canonical: "/",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#2563eb" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              "name": "Fastenr",
              "applicationCategory": "BusinessApplication",
              "description": "Customer success platform for tracking health scores, managing engagements, and reducing churn",
              "url": "https://fastenr.com",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "GBP",
                "description": "Free trial available"
              },
              "aggregateRating": {
                "@type": "AggregateRating",
                "ratingValue": "4.8",
                "ratingCount": "127"
              }
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            {children}
            <Toaster />
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
