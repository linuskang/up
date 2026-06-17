"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Monitor, Download, Check, Share, Loader2 } from "lucide-react"
import { toast } from "sonner"

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstaller() {
    const [mounted, setMounted] = useState(false)
    const [platform, setPlatform] = useState<"ios" | "android" | "desktop">("desktop")
    const [isStandalone, setIsStandalone] = useState(false)
    const [isInstalled, setIsInstalled] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [promptFired, setPromptFired] = useState(false)

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMounted(true)

        const ua = navigator.userAgent
        const isIOS = /iPad|iPhone|iPod/.test(ua) && !((window as unknown as Record<string, unknown>).MSStream)
        const isAndroid = /Android/.test(ua)

        if (isIOS) setPlatform("ios")
        else if (isAndroid) setPlatform("android")
        else setPlatform("desktop")

        const standalone = window.matchMedia("(display-mode: standalone)").matches
        setIsStandalone(standalone)

        if (standalone) {
            setIsInstalled(true)
        } else if ("getInstalledRelatedApps" in navigator) {
            const nav = navigator as Navigator & { getInstalledRelatedApps: () => Promise<{ platform: string; url?: string }[]> }
            nav.getInstalledRelatedApps().then((apps) => {
                if (apps.length > 0) setIsInstalled(true)
            }).catch(() => {})
        }

        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
            setPromptFired(true)
        }
        window.addEventListener("beforeinstallprompt", handler)

        return () => {
            window.removeEventListener("beforeinstallprompt", handler)
        }
    }, [])

    const handleInstall = async () => {
        if (deferredPrompt) {
            await deferredPrompt.prompt()
            const { outcome } = await deferredPrompt.userChoice
            if (outcome === "accepted") {
                setDeferredPrompt(null)
            }
            return
        }

        if (platform === "ios") {
            toast.info("Install on iOS", {
                description: "Open Safari, tap Share, then Add to Home Screen.",
            })
        } else if (platform === "android") {
            toast.info("Install on Android", {
                description: "Tap the menu (three dots) and select Add to Home screen.",
            })
        } else if (!promptFired) {
            toast.error("Install not available", {
                description:
                    "Your browser may not support app installation, or the page is not yet installable. Try opening in Chrome or check that you're on HTTPS.",
            })
        } else {
            toast.info("Install on Desktop", {
                description: "Use the menu → More tools → Create shortcut → Open as window.",
            })
        }
    }

    if (!mounted) {
        return (
            <Card className="w-full max-w-md bg-background ring-1 ring-foreground/10">
                <CardContent className="flex flex-col items-center gap-4 py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </CardContent>
            </Card>
        )
    }

    if (isStandalone) {
        return (
            <Card className="w-full max-w-md bg-background ring-1 ring-foreground/10">
                <CardContent className="flex flex-col items-center gap-4 py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/10">
                        <Check className="h-6 w-6 text-green-500" />
                    </div>
                    <p className="text-center text-lg font-medium">You are using the Upstream app!</p>
                    <p className="text-center text-sm text-muted-foreground">Thanks for installing.</p>
                </CardContent>
            </Card>
        )
    }

    if (isInstalled) {
        return (
            <Card className="w-full max-w-md bg-background ring-1 ring-foreground/10">
                <CardContent className="flex flex-col items-center gap-4 py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                        <Check className="h-6 w-6 text-primary" />
                    </div>
                    <p className="text-center text-lg font-medium">Upstream is already installed</p>
                    <p className="text-center text-sm text-muted-foreground">
                        Open it from your {platform === "android" ? "Home screen" : platform === "ios" ? "Home screen" : "Start menu or dock"}.
                    </p>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="flex w-full max-w-md flex-col gap-4">
            <Card className="bg-background ring-1 ring-foreground/10">
                <CardHeader className="text-center pb-2">
                    <CardTitle className="text-xl">Install Upstream</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center gap-4">
                    <p className="text-center text-sm text-muted-foreground">
                        Install Upstream as an app for quick access and a better experience.
                    </p>
                    <Button onClick={handleInstall} className="w-full gap-2">
                        <Download className="h-4 w-4" />
                        Install Upstream
                    </Button>
                </CardContent>
            </Card>

            {platform === "ios" && <IOSInstructions />}
            {platform === "android" && <AndroidInstructions />}
            {platform === "desktop" && <DesktopInstructions />}
        </div>
    )
}

function IOSInstructions() {
    return (
        <Card className="bg-background ring-1 ring-foreground/10">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                    <Smartphone className="h-5 w-5" /> Install on iOS
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                <p>
                    1. Open this page in <strong>Safari</strong>.
                </p>
                <p className="flex items-center gap-2">
                    2. Tap the <Share className="h-4 w-4 inline" /> Share button.
                </p>
                <p>
                    3. Tap <strong>Add to Home Screen</strong>.
                </p>
                <p>
                    4. Tap <strong>Add</strong>.
                </p>
            </CardContent>
        </Card>
    )
}

function AndroidInstructions() {
    return (
        <Card className="bg-background ring-1 ring-foreground/10">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                    <Smartphone className="h-5 w-5" /> Install on Android
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                <p>
                    1. Tap the menu (three dots) in the top right of your browser.
                </p>
                <p>
                    2. Tap <strong>Add to Home screen</strong>.
                </p>
                <p>
                    3. Tap <strong>Add</strong> on the confirmation dialog.
                </p>
            </CardContent>
        </Card>
    )
}

function DesktopInstructions() {
    return (
        <Card className="bg-background ring-1 ring-foreground/10">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                    <Monitor className="h-5 w-5" /> Install on Desktop
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                <p>
                    1. Click the menu (three lines) in the top right of Brave.
                </p>
                <p>
                    2. Go to <strong>More tools</strong> →{" "}
                    <strong>Create shortcut...</strong>
                </p>
                <p>
                    3. Check <strong>Open as window</strong> and click{" "}
                    <strong>Create</strong>.
                </p>
            </CardContent>
        </Card>
    )
}
