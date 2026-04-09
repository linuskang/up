"use client";

import { authClient } from "@/client/auth"
import { redirect } from "next/navigation";
import { Folder, GalleryVerticalEnd, Settings } from "lucide-react";
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


                </div>
            </main>
        </div>
    )
}
