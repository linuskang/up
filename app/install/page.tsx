import { PwaInstaller } from "@/components/pwa-installer"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export const metadata = {
    title: "Install Upstream",
    description: "Install Upstream as an app on your device.",
}

export default function InstallPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6">
            <div className="mb-8 flex flex-col items-center gap-2">
                <Button variant="ghost" className="rounded-full p-0">
                    <Link href="/" className="flex items-center justify-center">
                        <img
                            src="/logo.png"
                            alt="Upstream Logo"
                            className="h-10 w-10 rounded-full"
                        />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Get Upstream</h1>
                <p className="text-muted-foreground">Install it once, use it everywhere.</p>
            </div>
            <PwaInstaller />
        </div>
    )
}
