"use client";

import { authClient } from "@/client/auth"
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, UserRound, BriefcaseBusiness, CreditCard } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import { useRouter } from "next/navigation";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";



export default function Page() {
    const { data: session, isPending } = authClient.useSession();
    const [open, setOpen] = useState(false);

    if (isPending) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-white">
                <Navbar user={{}} />
                <main className="flex-1 flex justify-center">
                    <div className="w-full max-w-2xl p-6 space-y-4">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-20 rounded-xl" />
                        <Skeleton className="h-40 rounded-xl" />
                    </div>
                </main>
            </div>
        );
    }

    if (!session) {
        redirect("/login");
    }

    const handleLogout = async () => {
        await authClient.signOut();
    };

    return (
        <div className="flex min-h-screen flex-col bg-background text-white">
            <Navbar
                user={{
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image || "",
                }}
            />

            <main className="flex-1 flex justify-center">
                <div className="w-full max-w-2xl p-6 overflow-auto">
                    <h1 className="mb-4 text-3xl font-semibold text-white">Settings</h1>
                    <section className="mb-4 rounded-xl bg-card p-4 ring-1 ring-white/5">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="size-12 rounded-lg">
                                    <AvatarImage src={session.user.image || ""} alt={session.user.name} />
                                    <AvatarFallback className="rounded-lg text-sm text-white">
                                        {session.user.name?.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="text-base font-semibold text-white">{session.user.name}</p>
                                    <p className="text-sm text-eventcontent/65">{session.user.email}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                    <section className="mb-4 rounded-xl bg-card ring-1 ring-white/5">
                        <Link href="/settings/profile" className="flex items-center justify-between border-b border-white/5 px-4 py-4 transition-colors hover:bg-white/5 rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <UserRound className="size-4 text-eventcontent/70" />
                                <span className="text-lg font-medium text-white">Your Profile</span>
                            </div>
                            <ChevronRight className="size-4 text-eventcontent/60" />
                        </Link>
                        <Link href="/settings/projects" className="flex items-center justify-between border-b border-white/5 px-4 py-4 transition-colors hover:bg-white/5">
                            <div className="flex items-center gap-3">
                                <BriefcaseBusiness className="size-4 text-eventcontent/70" />
                                <span className="text-lg font-medium text-white">Manage Projects</span>
                            </div>
                            <ChevronRight className="size-4 text-eventcontent/60" />
                        </Link>
                        <Link href="/settings/plan" className="flex items-center justify-between px-4 py-4 transition-colors hover:bg-white/5 rounded-b-lg">
                            <div className="flex items-center gap-3">
                                <CreditCard className="size-4 text-eventcontent/70" />
                                <span className="text-lg font-medium text-white">Account Plan</span>
                            </div>
                            <ChevronRight className="size-4 text-eventcontent/60" />
                        </Link>
                    </section>
                    <AlertDialog open={open} onOpenChange={setOpen}>
                        <div className="flex items-center justify-between px-4 py-4 rounded-xl bg-card ring-1 ring-white/5">

                            <AlertDialogTrigger asChild>
                                <button className="text-sm font-medium text-red-500">
                                    Sign out
                                </button>
                            </AlertDialogTrigger>

                        </div>

                        <AlertDialogContent className="bg-card text-white border-white/10">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Log out?</AlertDialogTitle>
                                <AlertDialogDescription className="text-white/60">
                                    You’ll be signed out of your account and redirected to login.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel>
                                    Cancel
                                </AlertDialogCancel>

                                <AlertDialogAction
                                    onClick={handleLogout}
                                >
                                    Log out
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </main>
        </div>
    )
}
