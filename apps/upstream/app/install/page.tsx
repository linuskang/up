import { PwaInstaller } from "@/components/pwa-installer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import Image from "next/image"

export const metadata = {
    title: "Install Upstream",
    description: "Install Upstream as an app on your device.",
}

export default function InstallPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6">
            <div className="mb-4 flex flex-col items-center gap-2">
                <Button variant="ghost" className="rounded-full p-0">
                    <Link href="/" className="flex items-center justify-center">
                        <Image
                            src="/logo.png"
                            alt="Upstream Logo"
                            width={60}
                            height={60}
                            className="h-15 w-15 rounded-full"
                        />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold">Install Upstream</h1>
                <p className="text-muted-foreground">
                    Download our PWA app to use Upstream on your device.
                </p>
            </div>
            <PwaInstaller />
        </div>
    )
}
