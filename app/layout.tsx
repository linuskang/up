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
            <body className={`flex min-h-screen flex-col bg-background dark ${GeistSans.className}`}>
                <main className="flex-1">
                    <ThemeProvider attribute="class" defaultTheme="dark">
                        <TooltipProvider>
                            {children}
                            <Toaster richColors position="top-center" />
                        </TooltipProvider>
                    </ThemeProvider>
                </main>
                <footer className="w-full py-4 text-center text-xs text-muted-foreground">
                    Upstream is v0.2.0. Project by Linus Kang.
                </footer>
            </body>
        </html>
    )
}
