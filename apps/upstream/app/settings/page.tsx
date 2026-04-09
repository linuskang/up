"use client";

import { authClient } from "@/client/auth"
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Bell, ChevronRight, Folder, GalleryVerticalEnd, ReceiptText, Settings, ChartNoAxesColumn, UserRound, BriefcaseBusiness, CreditCard } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";

export default function Page() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-white">
            <Navbar
                navItems={
                    [
                        { label: "Projects", path: "/", icon: Folder },
                        { label: "Events", path: "/events", icon: GalleryVerticalEnd },
                        { label: "Settings", path: "/settings", icon: Settings },
                    ]
                }
                user={{
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image || "",
                }}
            />

            <main className="flex-1 flex justify-center">
                <div className="w-full max-w-2xl p-6 overflow-auto">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">Dashboard</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Settings</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <h1 className="mb-4 text-3xl font-semibold text-white">Settings</h1>

                    <section className="mb-4 rounded-xl bg-card p-4 ring-1 ring-white/5">
                        <div className="flex items-start justify-between gap-4">

                            <div className="flex items-center gap-3">
                                <Avatar className="size-12 rounded-lg">
                                    <AvatarImage src={session.user.image || ""} alt={session.user.name || "User Avatar"} />
                                    <AvatarFallback className="rounded-lg text-sm text-white">
                                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-base font-semibold text-white">{session.user.name || "User"}</p>
                                    <p className="text-sm text-eventcontent/65">{session.user.email}</p>
                                </div>
                            </div>

                        </div>


                    </section>

                    <section className="mb-4 rounded-xl bg-card ring-1 ring-white/5">
                        <Link href="/settings/profile" className="flex items-center justify-between border-b border-white/5 px-4 py-4 transition-colors hover:bg-white/5">
                            <div className="flex items-center gap-3">
                                <UserRound className="size-4 text-eventcontent/70" />
                                <span className="text-lg font-medium text-white">Your Profile</span>
                            </div>
                            <ChevronRight className="size-4 text-eventcontent/60" />
                        </Link>

                        <Link href="/settings/notifications" className="flex items-center justify-between border-b border-white/5 px-4 py-4 transition-colors hover:bg-white/5">
                            <div className="flex items-center gap-3">
                                <Bell className="size-4 text-eventcontent/70" />
                                <span className="text-lg font-medium text-white">Push Notifications</span>
                            </div>
                            <ChevronRight className="size-4 text-eventcontent/60" />
                        </Link>

                        <Link href="/settings/project" className="flex items-center justify-between border-b border-white/5 px-4 py-4 transition-colors hover:bg-white/5">
                            <div className="flex items-center gap-3">
                                <BriefcaseBusiness className="size-4 text-eventcontent/70" />
                                <span className="text-lg font-medium text-white">Manage Projects</span>
                            </div>
                            <ChevronRight className="size-4 text-eventcontent/60" />
                        </Link>

                        <Link href="/settings/billing" className="flex items-center justify-between border-b border-white/5 px-4 py-4 transition-colors hover:bg-white/5">
                            <div className="flex items-center gap-3">
                                <CreditCard className="size-4 text-eventcontent/70" />
                                <span className="text-lg font-medium text-white">Account Plan</span>
                            </div>
                            <ChevronRight className="size-4 text-eventcontent/60" />
                        </Link>

                        <Link href="/settings/usage" className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-white/5">
                            <div className="flex items-center gap-3">
                                <ChartNoAxesColumn className="size-4 text-eventcontent/70" />
                                <span className="text-lg font-medium text-white">Platform Usage</span>
                            </div>
                            <ChevronRight className="size-4 text-eventcontent/60" />
                        </Link>
                    </section>
                </div>
            </main>
        </div>
    )
}
