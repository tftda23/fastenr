import { Metadata } from "next"

export const metadata: Metadata = {
  title: "See a Demo - Fastenr",
  description: "See how Fastenr can transform your customer success operations with AI-powered insights and automated workflows.",
}

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}