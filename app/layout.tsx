import type { Metadata } from "next"
import { Inter, Cinzel, Raleway } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
})

const cinzel = Cinzel({
  subsets: ["latin"],
  variable: "--font-cinzel",
  display: "swap",
  weight: ["400", "500", "600", "700", "900"],
})

const raleway = Raleway({
  subsets: ["latin"],
  variable: "--font-raleway",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Lumos · Illuminate Your Talent",
  description: "Illuminate Your Talent · Powered by Flamenzi",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.variable} ${cinzel.variable} ${raleway.variable} font-inter antialiased`}>
        {children}
      </body>
    </html>
  )
}
