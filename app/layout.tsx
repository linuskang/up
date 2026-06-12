import { TooltipProvider } from "@/components/ui/tooltip"
import { ThemeProvider } from "@/components/theme-provider"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"
export const metadata = {
  title: "Upstream",
  description: "A simple logging platform built for developers.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`flex min-h-screen flex-col bg-background ${GeistSans.className}`}>
        <main>
          <ThemeProvider attribute="class" defaultTheme="dark">
            <TooltipProvider>
              {children}
              <Toaster richColors position="top-center" />
            </TooltipProvider>
          </ThemeProvider>
        </main>
      </body>
    </html>
  )
}
