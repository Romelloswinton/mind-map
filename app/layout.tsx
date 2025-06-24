import { ClerkProvider } from "@clerk/nextjs"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "MindMap AI - The Smartest Way to Organize Ideas",
  description:
    "Reimagine how you brainstorm with AI-assisted mind mapping that helps you create, connect, and visualize ideas effortlessly.",
  keywords:
    "mind mapping, AI, brainstorming, organization, productivity, collaboration",
  authors: [{ name: "MindMap AI Team" }],
  openGraph: {
    title: "MindMap AI - The Smartest Way to Organize Ideas",
    description: "AI-powered mind mapping for modern teams and creators",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "MindMap AI - The Smartest Way to Organize Ideas",
    description: "AI-powered mind mapping for modern teams and creators",
    images: ["/og-image.png"],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>{children}</body>
      </html>
    </ClerkProvider>
  )
}
