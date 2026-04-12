"use client";

import { Button } from "@workspace/ui/components/button";
import { usePathname } from "next/navigation";
import type { ElementType } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import Link from "next/link";
import { Folder, Settings } from "lucide-react";

interface NavItem {
    label: string;
    path: string;
    icon?: ElementType;
}

interface NavbarProps {
    user: {
        name?: string;
        email?: string;
        image?: string;
    };
}

const navItems: NavItem[] = [
    { label: "Projects", path: "/", icon: Folder },
    { label: "Settings", path: "/settings", icon: Settings },
];

export default function Navbar({ user }: NavbarProps) {
    const pathname = usePathname();

    return (
        <nav className="backdrop-blur-sm px-5 py-2">
            <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-3">
                <div className="flex items-center gap-2">
                    <Link href="/">
                        <img src="/logo.png" height="48" width="48" alt="Logo" />
                    </Link>
                </div>

                <div className="flex items-center justify-center gap-1">
                    {navItems.map((item) => {
                        const isActive = pathname === item.path;
                        const Icon = item.icon;
                        return (
                            <Link href={item.path} key={item.path}>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`text-sm flex items-center gap-1 ${isActive ? "bg-white/5" : "hover:bg-white/5"
                                        }`}
                                >
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {item.label}
                                </Button>
                            </Link>
                        );
                    })}
                </div>

                <div className="justify-self-end">
                    <Link href="/settings">
                        <Button
                            variant="ghost"
                            className="cursor-pointer group h-11 gap-3 bg-white/5 px-2.5 text-left hover:bg-white/10 focus-visible:ring-0 focus-visible:border-transparent focus-visible:outline-none aria-expanded:ring-0 aria-expanded:border-transparent"
                        >
                            <span className="hidden min-w-0 flex-col items-start leading-tight sm:flex">
                                <span className="max-w-28 truncate text-sm font-semibold text-white">
                                    {user.name?.split(" ")[0] || "User"}
                                </span>
                            </span>
                            <Avatar className="size-7">
                                <AvatarImage className="rounded-md" src={user.image} alt={user.name || "User Avatar"} />
                                <AvatarFallback className="text-white text-xs">
                                    {user.name?.charAt(0).toUpperCase() || "U"}
                                </AvatarFallback>
                            </Avatar>
                        </Button>
                    </Link>
                </div>
            </div>
        </nav>
    );
}
