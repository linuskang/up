import { Button } from "@/components/ui/button"
import { GeistMono } from "geist/font/mono"
import Image from "next/image"
import Link from "next/link"


export function Navbar() {
    return (
        <nav className="fixed top-0 bg-background right-0 left-0 z-50 border-b border-transparent">
            <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3">
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <Link href="/home">
                        <Image src="/logo.png" width={40} height={40} alt="Logo" className="sm:size-12" />
                    </Link>

                    <span className={`${GeistMono.className} rounded-sm bg-card px-1.5 py-0.5 text-[10px] text-white sm:px-2 sm:py-1 sm:text-xs`}>
                        beta
                    </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5">
                    <Button variant="ghost" size="sm" className="px-1.5 sm:px-2 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground">
                        <Link href="/docs">Docs</Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="px-1.5 sm:px-2 text-[11px] sm:text-xs font-medium text-muted-foreground hover:text-foreground">
                        <Link target="_blank" href="https://github.com/linusdotmy/upstream">Github</Link>
                    </Button>
                    <Button size="sm" className="px-1.5 sm:px-2 text-[11px] sm:text-xs font-medium">
                        <Link href="/">Open app</Link>
                    </Button>
                </div>
            </div>
        </nav>
    )
}