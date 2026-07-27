import type { Metadata } from "next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { GeistSans } from "geist/font/sans"
import { RegisterServiceWorker } from "@/components/register-sw"
import "./globals.css"
import { Toaster } from "@/components/ui/sonner"

export const metadata: Metadata = {
    title: "Upstream",
    description: "A simple logging platform built for developers.",
    manifest: "/manifest.webmanifest",
    appleWebApp: {
        capable: true,
        statusBarStyle: "default",
        title: "Upstream"
    }
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
                <RegisterServiceWorker />
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
