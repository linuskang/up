import { PwaInstaller } from "@/components/pwa-installer"

export const metadata = {
    title: "Install Upstream",
    description: "Install Upstream as an app on your device.",
}

export default function InstallPage() {
    return (
        <div className="flex min-h-svh flex-col items-center justify-center p-6">
            <div className="mb-8 flex flex-col items-center gap-2">
                <h1 className="text-3xl font-bold">Get Upstream</h1>
                <p className="text-muted-foreground">Install it once, use it everywhere.</p>
            </div>
            <PwaInstaller />
        </div>
    )
}
