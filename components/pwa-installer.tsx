"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Monitor, Download, Check, Share, Info } from "lucide-react"
import { toast } from "sonner"

type BeforeInstallPromptEvent = Event & {
    prompt: () => Promise<void>
    userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PwaInstaller() {
    const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
    const [isInstalled, setIsInstalled] = useState(false)
    const [platform, setPlatform] = useState<"ios" | "android" | "desktop" | "unknown">("unknown")
    const [isBrave, setIsBrave] = useState(false)

    useEffect(() => {
        const inStandalone =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone === true
        setIsInstalled(inStandalone)

        const ua = navigator.userAgent
        const isIOS = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream
        const isAndroid = /Android/.test(ua)
        const isDesktop = !/Mobi|Android/i.test(ua)

        if (isIOS) setPlatform("ios")
        else if (isAndroid) setPlatform("android")
        else if (isDesktop) setPlatform("desktop")
        else setPlatform("unknown")

        setIsBrave((navigator as any).brave?.isBrave?.name === "isBrave" || false)

        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e as BeforeInstallPromptEvent)
        }
        window.addEventListener("beforeinstallprompt", handler)

        const installedHandler = () => {
            setDeferredPrompt(null)
            setIsInstalled(true)
        }
        window.addEventListener("appinstalled", installedHandler)

        return () => {
            window.removeEventListener("beforeinstallprompt", handler)
            window.removeEventListener("appinstalled", installedHandler)
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

        toast.info("Use your browser menu to install", {
            description:
                "Look for 'Add to Home screen' or 'Install' in the browser menu.",
        })
    }

    if (isInstalled) {
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
                    {deferredPrompt === null && (
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Info className="h-3.5 w-3.5" />
                            If the button doesn&apos;t trigger a prompt, use your browser menu.
                        </p>
                    )}
                </CardContent>
            </Card>

            {platform === "ios" && <IOSInstructions />}
            {platform === "android" && <AndroidInstructions isBrave={isBrave} />}
            {platform === "desktop" && <DesktopInstructions isBrave={isBrave} />}
            {platform === "unknown" && <GenericInstructions />}
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
                    1. Open this page in <strong>Safari</strong> (Chrome on iOS cannot install PWAs).
                </p>
                <p className="flex items-center gap-2">
                    2. Tap the <Share className="h-4 w-4 inline" /> Share button in the toolbar.
                </p>
                <p>
                    3. Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
                <p>
                    4. Tap <strong>Add</strong> in the top right corner.
                </p>
            </CardContent>
        </Card>
    )
}

function AndroidInstructions({ isBrave }: { isBrave: boolean }) {
    return (
        <Card className="bg-background ring-1 ring-foreground/10">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                    <Smartphone className="h-5 w-5" /> Install on Android
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                {isBrave ? (
                    <>
                        <p>1. Tap the menu (three dots) in the bottom right of Brave.</p>
                        <p>
                            2. Tap <strong>Add to Home screen</strong>.
                        </p>
                        <p>3. Tap <strong>Add</strong> on the confirmation dialog.</p>
                    </>
                ) : (
                    <>
                        <p>1. Tap the menu (three dots) in the top right of your browser.</p>
                        <p>
                            2. Tap <strong>Add to Home screen</strong> or <strong>Install app</strong>.
                        </p>
                        <p>3. Follow the prompts to complete installation.</p>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

function DesktopInstructions({ isBrave }: { isBrave: boolean }) {
    return (
        <Card className="bg-background ring-1 ring-foreground/10">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl flex items-center justify-center gap-2">
                    <Monitor className="h-5 w-5" /> Install on Desktop
                </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                {isBrave ? (
                    <>
                        <p>1. Click the menu (three lines) in the top right of Brave.</p>
                        <p>
                            2. Go to <strong>More tools</strong> →{" "}
                            <strong>Create shortcut...</strong>
                        </p>
                        <p>
                            3. Check <strong>Open as window</strong> and click{" "}
                            <strong>Create</strong>.
                        </p>
                    </>
                ) : (
                    <>
                        <p>
                            1. Look for the install icon in your browser&apos;s address bar (usually on the right side).
                        </p>
                        <p>
                            2. Click it and select <strong>Install Upstream</strong>.
                        </p>
                        <p>Alternatively:</p>
                        <p>
                            Open the browser menu and look for <strong>Install Upstream</strong> or{" "}
                            <strong>Create shortcut</strong>.
                        </p>
                    </>
                )}
            </CardContent>
        </Card>
    )
}

function GenericInstructions() {
    return (
        <Card className="bg-background ring-1 ring-foreground/10">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-xl">Install Upstream</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
                <p>
                    To install Upstream, use your browser&apos;s menu and look for an option like{" "}
                    <strong>Install</strong>, <strong>Add to Home Screen</strong>, or{" "}
                    <strong>Create shortcut</strong>.
                </p>
                <p>If you&apos;re on mobile, try Chrome or Brave for the best experience.</p>
            </CardContent>
        </Card>
    )
}
