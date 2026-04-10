"use client";

import { authClient } from "@/client/auth"
import { redirect } from "next/navigation";
import { use, useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
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
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";

type Project = {
    id: string;
    name: string;
    members: {
        id: string;
        role: "ADMIN" | "MEMBER";
        user: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
    }[];
};

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
    const { id } = use(params);
    const { data: session, isPending } = authClient.useSession();
    const [project, setProject] = useState<Project | null>(null);
    const quickLinks = [
        {
            label: "API Keys",
            description: "Create, rotate, and revoke keys",
            href: `/projects/${id}/keys`,
        },
        {
            label: "Events",
            description: "View project event stream",
            href: `/projects/${id}/events`,
        },
    ];

    useEffect(() => {

        async function loadProject() {
            const response = await fetch(`/api/v1/project/${id}`, { method: "GET" });

            if (!response.ok) {
                return;
            }

            const data = (await response.json()) as { project: Project };

            if (data.project) {
                setProject(data.project);
            }
        }

        loadProject();
    }, [id]);

    if (!project) {
        return <div>404</div>;
    }

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

                <div className="w-full max-w-2xl p-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">Project</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{project.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                    </div>

                    <div className="mb-8">
                        <h2 className="text-sm font-semibold mb-3">Statistics</h2>
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">API Keys</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">Events Today</p>
                                <p className="text-2xl font-bold">0</p>
                            </div>
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">Members</p>
                                <p className="text-2xl font-semibold">{project.members.length}</p>
                            </div>
                        </div>
                    </div>


                </div>

            </main >
        </div >
    )
}
