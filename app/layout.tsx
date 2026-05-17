import { Geist, Geist_Mono, Inter } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils";
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

export const metadata = {
    title: "Upstream",
    description: "Simple and open logging for developers",
}

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' })

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html
            lang="en"
            suppressHydrationWarning
            className={cn("antialiased", "font-sans", inter.variable)}
        >
            <body>
                <ThemeProvider>
                    <TooltipProvider>
                        {children}
                        <Toaster position="top-center" />
                    </TooltipProvider>
                </ThemeProvider>
            </body>
        </html>
    )
}
