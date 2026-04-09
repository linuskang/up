"use client";

import { authClient } from "@/client/auth"
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
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
import Link from "next/link";

type Project = {
    id: string;
    name: string;
};

export default function Page() {
    const { data: session, isPending } = authClient.useSession();
    const [projects, setProjects] = useState<Project[]>([]);

    useEffect(() => {
        let isCancelled = false;

        async function loadProjects() {
            try {
                const response = await fetch("/api/v1/project", { method: "GET" });

                if (!response.ok) {
                    return;
                }

                const data = (await response.json()) as { projects?: Project[] };

                if (!isCancelled && data.projects) {
                    setProjects(data.projects);
                }
            } catch {
                // Keep UI usable even if project fetch fails.
            }
        }

        loadProjects();

        return () => {
            isCancelled = true;
        };
    }, []);

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
    }

    const accountPlan = (session.user as { accountPlan?: string }).accountPlan || "Hobby";



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
                                <p className="text-2xl font-bold">{projects.length}</p>
                            </div>
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">Events Today</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">Account Plan</p>
                                <p className="text-2xl font-semibold">{accountPlan}</p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold">Your Projects</h2>
                            <Link href="/new-project">
                                <Button>Create Project</Button>
                            </Link>
                        </div>
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
                                {projects.map((project) => (
                                    <div key={project.id} className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                        <p className="text-sm font-semibold">{project.name}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold mb-3 mt-8">Recent Activity</h2>
                        <div className="space-y-2">
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-sm text-eventcontent/65">No recent activity</p>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}
