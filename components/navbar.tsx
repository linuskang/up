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

// Components
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/client/auth"
import { ExternalLink, Folder, Home, Layers, LogOut, Settings } from "lucide-react"

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
        <nav className="sticky top-0 z-50 w-full bg-background px-3 py-1">
            <div className="mx-auto grid max-w-7xl grid-cols-[auto_1fr_auto] items-center gap-2 ">
                <div className="flex items-center gap-1">
                    <Link href="/">
                        <Image src="/logo.png" width={45} height={45} alt="Logo" />
                    </Link>
                </div>

                <div className="flex items-center justify-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path
                        const Icon = item.icon
                        return (
                            <Link href={item.path} key={item.path}>
                                <Button
                                    variant="ghost"
                                    className={`rounded-base flex items-center gap-1.5 px-2.5 py-2.5 text-xs font-medium transition-colors ${isActive
                                        ? "bg-muted text-foreground"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                        }`}
                                >
                                    {Icon && <Icon className="size-5" />}
                                    <span className={`${isActive ? "inline" : "hidden"} sm:inline`}>{item.label}</span>
                                </Button>
                            </Link>
                        )
                    })}
                </div>

                <div className="justify-self-end">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="group h-11 cursor-pointer gap-2 px-1.5 text-left focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none aria-expanded:border-transparent aria-expanded:ring-0"
                            >
                                <div className="relative size-8 overflow-hidden rounded-md border border-border/60 bg-secondary">
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
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuItem asChild>
                                <Link href="/home" className="flex items-center font-medium gap-2 cursor-pointer">
                                    <Home className="size-3.5" />
                                    Homepage
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/docs" className="flex items-center font-medium gap-2 cursor-pointer">
                                    <Folder className="size-3.5" />
                                    Docs
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="https://github.com/linusdotmy/upstream" target="_blank" className="flex items-center font-medium gap-2 cursor-pointer">
                                    <ExternalLink className="size-3.5" />
                                    Github
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                                <Link href="/settings" className="flex items-center font-medium gap-2 cursor-pointer">
                                    <Settings className="size-3.5" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                variant="destructive"
                                onClick={() => authClient.signOut()}
                                className="flex items-center gap-2 cursor-pointer"
                            >
                                <LogOut className="size-3.5" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </nav>
    )
}
