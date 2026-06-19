import { authClient } from "@/client/auth"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Download, ExternalLink, Settings, LogOut } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function User() {
    const { data: session } = authClient.useSession()

    if (!session) {
        return null
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    className="group h-11 cursor-pointer gap-2 px-1.5 text-left focus-visible:border-transparent focus-visible:ring-0 focus-visible:outline-none aria-expanded:border-transparent aria-expanded:ring-0"
                >
                    <div className="relative size-8 overflow-hidden rounded-md border border-border/60 bg-secondary">
                        <Image
                            src={session.user.image || ""}
                            alt={session.user.name || "Avatar"}
                            width={32}
                            height={32}
                            unoptimized
                            className="object-cover"
                        />
                    </div>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" >
                <DropdownMenuItem asChild>
                    <Link href="/settings" className="flex cursor-pointer items-center gap-2">
                        <Settings className="size-3.5 text-muted-foreground" />
                        Settings
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                    variant="destructive"
                    onClick={() => authClient.signOut()}
                    className="flex cursor-pointer items-center gap-2"
                >
                    <LogOut className="size-3.5" />
                    Sign out
                </DropdownMenuItem>


                <DropdownMenuSeparator />

                <DropdownMenuItem asChild>
                    <Link href="https://upstream.linus.my/docs" target="_blank" className="flex cursor-pointer items-center gap-2">
                        <ExternalLink className="size-3.5 text-muted-foreground" />
                        Docs
                    </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                    <Link href="/install" className="flex cursor-pointer items-center gap-2">
                        <Download className="size-3.5 text-muted-foreground" />
                        Install App
                    </Link>
                </DropdownMenuItem>

            </DropdownMenuContent>
        </DropdownMenu>
    )
}