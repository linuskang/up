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

                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold">Recent Events</h2>
                            <Link href={`/projects/${id}/events`}>
                                <Button className="cursor-pointer">Go to Events</Button>
                            </Link>
                        </div>
                        <div className="space-y-2">
                            <div className="rounded-lg bg-card p-4 ring-1 ring-white/5 text-center">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyTitle>No Events Yet</EmptyTitle>
                                        <EmptyDescription>
                                            There hasn&apos;t been any events in this project yet.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3 mt-8">
                            <h2 className="text-sm font-semibold">Members</h2>
                            <Link href={`/projects/${id}/invite`}>
                                <Button className="cursor-pointer">Invite Members</Button>
                            </Link>
                        </div>
                        <div className="space-y-2">
                            {project.members.length === 0 ? (
                                <div className="rounded-lg bg-card p-4 ring-1 ring-white/5 text-center">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyTitle>No Members Yet</EmptyTitle>
                                            <EmptyDescription>
                                                There are no members assigned to this project yet.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </div>
                            ) : (
                                <div className="rounded-lg bg-card ring-1 ring-white/5">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/10">
                                                <TableHead className="px-4">Member</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead className="w-28">Role</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {project.members.map((member) => {
                                                const initial = member.user.name?.charAt(0).toUpperCase() || "U";
                                                return (
                                                    <TableRow key={member.id} className="border-white/10 hover:bg-white/5">
                                                        <TableCell className="px-4">
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <Avatar className="size-8">
                                                                    <AvatarImage src={member.user.image || undefined} alt={member.user.name} />
                                                                    <AvatarFallback>{initial}</AvatarFallback>
                                                                </Avatar>
                                                                <p className="truncate text-sm font-medium text-white">{member.user.name}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <p className="truncate text-xs text-eventcontent/65">{member.user.email}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-white/80">
                                                                {member.role}
                                                            </span>
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold mb-3 mt-8">API Keys</h2>
                        <div className="space-y-2">
                            <div className="rounded-lg bg-card p-4 ring-1 ring-white/5 text-center">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyTitle>No API Keys Yet</EmptyTitle>
                                        <EmptyDescription>
                                            There are no API keys for this project yet.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-sm font-semibold mb-3 mt-8">Recent Activity</h2>
                        <div className="space-y-2">
                            <div className="rounded-lg bg-card p-4 ring-1 ring-white/5 text-center">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyTitle>No Activity Yet</EmptyTitle>
                                        <EmptyDescription>
                                            There hasn&apos;t been any activity in your account yet.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        </div>
                    </div>
                </div>

            </main >
        </div >
    )
}
