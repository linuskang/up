//                                  __
//                                 |  \
//  __    __   ______    _______  _| $$_     ______    ______    ______   ______ ____
// |  \  |  \ /      \  /       \|   $$ \   /      \  /      \  |      \ |      \    \
// | $$  | $$|  $$$$$$\|  $$$$$$$ \$$$$$$  |  $$$$$$\|  $$$$$$\  \$$$$$$\| $$$$$$\$$$$\
// | $$  | $$| $$  | $$ \$$    \   | $$ __ | $$   \$$| $$    $$ /      $$| $$ | $$ | $$
// | $$__/ $$| $$__/ $$ _\$$$$$$\  | $$|  \| $$      | $$$$$$$$|  $$$$$$$| $$ | $$ | $$
//  \$$    $$| $$    $$|       $$   \$$  $$| $$       \$$     \ \$$    $$| $$ | $$ | $$
//   \$$$$$$ | $$$$$$$  \$$$$$$$     \$$$$  \$$        \$$$$$$$  \$$$$$$$ \$$  \$$  \$$
//           | $$
//           | $$
//            \$$

"use client"

// Libraries
import { usePathname } from "next/navigation"
import type { ElementType } from "react"
import Image from "next/image"
import Link from "next/link"
import { GeistMono } from "geist/font/mono";

// Components
import { Button } from "@/components/ui/button"
import { Folder, Layers, Settings } from "lucide-react"

// Types
interface NavItem {
    label: string
    path: string
    icon?: ElementType
}

interface NavbarProps {
    user: {
        name?: string | null
        email: string
        image?: string | null
    }
}

const navItems: NavItem[] = [
    { label: "Projects", path: "/", icon: Folder },
    { label: "Events", path: "/viewer", icon: Layers },
    { label: "Settings", path: "/settings", icon: Settings },
]

export default function Navbar({ user }: NavbarProps) {
    const pathname = usePathname()

    return (
        <nav className="sticky top-0 z-50 w-full bg-background px-5 py-3">
            <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="flex items-center gap-1">
                    <Link href="/">
                        <Image src="/logo.png" width={48} height={48} alt="Logo" />
                    </Link>

                    <span className={`${GeistMono.className} rounded-sm bg-card px-2 py-1 text-xs font-sm text-white`}>
                        beta
                    </span>
                </div>

                <div className="flex items-center justify-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path
                        const Icon = item.icon
                        return (
                            <Link href={item.path} key={item.path}>
                                <Button
                                    variant="ghost"
                                    className={`rounded-base flex items-center gap-2 px-4 py-4 text-sm font-medium transition-colors ${isActive
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    {Icon && <Icon className="size-5" />}
                                    {item.label}
                                </Button>
                            </Link>
                        )
                    })}
                </div>

                <div className="justify-self-end">
                    <Link href="/settings">
                        <Button
                            variant="ghost"
                            className="group h-11 cursor-pointer gap-3 bg-white/5 px-2.5 text-left hover:bg-white/10 focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none aria-expanded:border-transparent aria-expanded:ring-0"
                        >
                            <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
                                <span className="max-w-28 truncate text-sm font-semibold text-foreground">
                                    {user.name?.split(" ")[0]}
                                </span>
                            </span>
                            <div className="relative -ml-1 size-8 overflow-hidden rounded-md border border-border/60 bg-secondary">
                                <Image
                                    src={user.image || ""}
                                    alt={user.name || "Avatar"}
                                    width={32}
                                    height={32}
                                    unoptimized
                                    className="object-cover"
                                />
                            </div>
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    )
}
