import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { GeistMono } from "geist/font/mono"
import { cn } from "@/lib/utils"
import { ThemeProvider } from "@/components/theme-provider"
import { ErrorBoundary } from "@/components/error-boundary"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
})

export const metadata = {
  title: "Scanresume - AI Resume Analyzer",
  description: "Analyze your resume against job descriptions with AI",
  generator: 'v0.dev'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <style>{`
          html, body {
            margin: 0;
            padding: 0;
          }
        `}</style>
      </head>
      <body className={cn("min-h-screen font-sans antialiased m-0 p-0", inter.variable, GeistMono.variable)}>
        <ErrorBoundary>
          <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
            <div className="relative min-h-screen dot-grid-fine">
              {/* Gradient overlays for better readability */}
              <div className="fixed top-0 left-0 right-0 h-[200px] z-[1] bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none"></div>
              <div className="fixed bottom-0 left-0 right-0 h-[200px] z-[1] bg-gradient-to-t from-[#0a0a0a] to-transparent pointer-events-none"></div>

              {/* Content */}
              <div className="relative z-[2]">{children}</div>
            </div>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}
