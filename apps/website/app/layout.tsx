import type { Metadata } from "next"
import { TooltipProvider } from "@uplabs/ui/components/tooltip"
import { GeistSans } from "geist/font/sans"
import "./globals.css"
import { Toaster } from "@uplabs/ui/components/sonner"

export const metadata: Metadata = {
    title: "Upstream",
    description: "A simple logging platform built for developers.",
}

export const viewport = {
    width: "device-width",
    initialScale: 1,
    themeColor: "#0a0a0a",
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="en">
            <body
                className={`flex min-h-screen flex-col bg-background ${GeistSans.className}`}
            >
                <main className="flex-1">
                    <TooltipProvider>
                        {children}
                        <Toaster position="top-center" />
                    </TooltipProvider>
                </main>
            </body>
        </html>
    )
}
