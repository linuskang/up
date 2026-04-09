"use client";

import { authClient } from "@/client/auth"
import { redirect } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@workspace/ui/components/empty"
import { ArrowUpRightIcon, Folder, GalleryVerticalEnd, Settings } from "lucide-react";
import Navbar from "@/components/navbar";

export default function Page() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
    }

    const projects: { name: string }[] = [];

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
                    <div className="mb-8">
                        <h2 className="text-sm font-semibold mb-3">Account Statistics</h2>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">Total Projects</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">Events Today</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">Account Plan</p>
                                <p className="text-2xl font-semibold">Hobby</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold mb-3">Your Projects</h2>
                        {projects.length === 0 ? (
                            <div className="rounded-lg bg-card p-4 ring-1 ring-white/5 text-center">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Folder />
                                        </EmptyMedia>
                                        <EmptyTitle>No Projects Yet</EmptyTitle>
                                        <EmptyDescription>
                                            You haven&apos;t created any projects yet. Get started by creating
                                            your first project to start tracking events.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <EmptyContent className="flex-row justify-center gap-2">
                                        <Button>Create Project</Button>
                                    </EmptyContent>
                                    <Button
                                        variant="link"
                                        asChild
                                        className="text-muted-foreground"
                                        size="sm"
                                    >
                                        <a href="#">
                                            Learn More <ArrowUpRightIcon />
                                        </a>
                                    </Button>
                                </Empty>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {projects.map((project, index) => (
                                    <div key={index} className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                        <p className="text-sm font-semibold">{project.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    )
}
