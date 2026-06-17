import { Button } from "@/components/ui/button"
import { GeistMono } from "geist/font/mono"
import Image from "next/image"
import Link from "next/link"


export function Navbar() {
    return (
        <nav className="fixed top-0 right-0 left-0 z-50 border-b border-transparent">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <Link href="/home">
                        <Image src="/logo.png" width={48} height={48} alt="Logo" />
                    </Link>

                    <span className={`${GeistMono.className} rounded-sm bg-card px-2 py-1 text-xs font-sm text-white`}>
                        beta
                    </span>
                </div>

                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                        <Link href="/docs">Docs</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs font-medium text-muted-foreground hover:text-foreground">
                        <Link target="_blank" href="https://github.com/linusdotmy/upstream">Github</Link>
                    </Button>
                    <Button size="sm" className="text-xs font-medium">
                        <Link href="/">Open app</Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}