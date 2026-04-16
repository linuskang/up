"use client";

import { authClient } from "@/client/auth"
import type { Project } from "@/types";
import { redirect, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Skeleton } from "@workspace/ui/components/skeleton";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@workspace/ui/components/empty"
import { ArrowUpRightIcon, Folder, Plus, Mail } from "lucide-react";
import Navbar from "@/components/navbar";
import Link from "next/link";

type ProjectLimits = {
    maxProjects: number;
    usedProjects: number;
    remainingProjects: number;
    canCreateProject: boolean;
};

type Stats = {
    eventsToday: number;
    eventsTotal: number;
};

type PendingInvitation = {
    id: string;
    token: string;
    role: string;
    expiresAt: string;
    project: { id: string; name: string };
    invitedBy: { name: string; image: string | null };
};

export default function Page() {
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [projects, setProjects] = useState<Project[]>([]);
    const [limits, setLimits] = useState<ProjectLimits | null>(null);
    const [stats, setStats] = useState<Stats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [invitations, setInvitations] = useState<PendingInvitation[]>([]);
    const [acceptingId, setAcceptingId] = useState<string | null>(null);
    const [decliningId, setDecliningId] = useState<string | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function loadData() {
            setIsLoading(true);
            try {
                const [projectsRes, statsRes, invitationsRes] = await Promise.all([
                    fetch("/api/v1/project", { method: "GET" }),
                    fetch("/api/v1/stats", { method: "GET" }),
                    fetch("/api/v1/invitations", { method: "GET" }),
                ]);

                if (!isCancelled) {
                    if (projectsRes.ok) {
                        const data = (await projectsRes.json()) as { projects?: Project[]; limits?: ProjectLimits };
                        setProjects(data.projects ?? []);
                        setLimits(data.limits ?? null);
                    }
                    if (statsRes.ok) {
                        const data = (await statsRes.json()) as Stats;
                        setStats(data);
                    }
                    if (invitationsRes.ok) {
                        const data = (await invitationsRes.json()) as { invitations?: PendingInvitation[] };
                        setInvitations(data.invitations ?? []);
                    }
                }
            } finally {
                if (!isCancelled) setIsLoading(false);
            }
        }

        loadData();

        return () => { isCancelled = true; };
    }, []);

    if (isPending) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-white">
                <Navbar user={{}} />
                <main className="flex-1 flex justify-center">
                    <div className="w-full max-w-2xl p-6 space-y-6">
                        <Skeleton className="h-9 w-64" />
                        <div className="grid grid-cols-3 gap-3">
                            <Skeleton className="h-16 rounded-lg" />
                            <Skeleton className="h-16 rounded-lg" />
                            <Skeleton className="h-16 rounded-lg" />
                        </div>
                        <Skeleton className="h-48 rounded-lg" />
                    </div>
                </main>
            </div>
        );
    }

    if (!session) {
        redirect("/login");
    }

    const accountPlan = (session.user as { accountPlan?: string }).accountPlan || "Hobby";
    const canCreateProject = limits?.canCreateProject ?? true;
    const projectUsageLabel = limits
        ? `${limits.usedProjects}/${limits.maxProjects}`
        : `${projects.length}`;

    async function acceptInvitation(token: string, invId: string) {
        setAcceptingId(invId);
        try {
            const res = await fetch(`/api/v1/invitations/${token}`, { method: "POST" });
            if (!res.ok) return;
            const data = (await res.json()) as { projectId?: string };
            setInvitations((prev) => prev.filter((i) => i.id !== invId));
            if (data.projectId) router.push(`/projects/${data.projectId}`);
        } finally {
            setAcceptingId(null);
        }
    }

    async function declineInvitation(token: string, invId: string) {
        setDecliningId(invId);
        try {
            const res = await fetch(`/api/v1/invitations/${token}`, { method: "DELETE" });
            if (!res.ok) return;
            setInvitations((prev) => prev.filter((i) => i.id !== invId));
        } finally {
            setDecliningId(null);
        }
    }

    function getMyRole(project: Project) {
        return project.members.find((member) => member.user.id === session?.user.id)?.role;
    }

    const ownedProjects = projects.filter((project) => getMyRole(project) === "OWNER");
    const invitedProjects = projects.filter((project) => {
        const role = getMyRole(project);
        return role === "ADMIN" || role === "MEMBER";
    });

    function getOwner(project: Project) {
        return project.members.find((member) => member.role === "OWNER");
    }

    function renderOwnerCell(project: Project) {
        const owner = getOwner(project);

        if (!owner) {
            return <span className="text-muted-foreground">Unknown</span>;
        }

        return (
            <div className="flex items-center gap-2">
                <Avatar className="size-6 rounded-md">
                    <AvatarImage src={owner.user.image ?? undefined} alt={owner.user.name} />
                    <AvatarFallback className="rounded-md text-xs">
                        {owner.user.name?.charAt(0).toUpperCase() || owner.user.email.charAt(0).toUpperCase()}
                    </AvatarFallback>
                </Avatar>
                <span className="truncate text-sm">{owner.user.name}</span>
            </div>
        );
    }

    function renderProjectTable(list: Project[]) {
        return (
            <div className="overflow-hidden bg-card rounded-lg ring-1 ring-white/5">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="px-4 py-2 font-semibold">Project</th>
                            <th className="px-4 py-2 font-semibold">Owner</th>
                            <th className="px-4 py-2 font-semibold text-eventcontent/65">ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((project) => (
                            <tr
                                key={project.id}
                                onClick={() => router.push(`/projects/${project.id}`)}
                                className="cursor-pointer border-t border-white/5 hover:bg-muted/40 transition"
                            >
                                <td className="px-4 py-3 font-medium">{project.name}</td>
                                <td className="px-4 py-3">{renderOwnerCell(project)}</td>
                                <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{project.id}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
    }

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

                    <div className="mb-4">
                        <h1 className="text-3xl font-semibold tracking-tight mb-1">
                            Welcome, {session.user.name?.split(" ")[0]}
                        </h1>
                        <p className="text-sm text-eventcontent/60">Here&apos;s an overview of your Upstream workspace.</p>
                    </div>

                    <div className="mb-8">
                        <div className="grid grid-cols-3 gap-3">
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">Projects Used</p>
                                {isLoading ? (
                                    <Skeleton className="mt-1 h-8 w-16" />
                                ) : (
                                    <p className="text-2xl font-bold">{projectUsageLabel}</p>
                                )}
                            </div>
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">Events Today</p>
                                {isLoading ? (
                                    <Skeleton className="mt-1 h-8 w-16" />
                                ) : (
                                    <p className="text-2xl font-bold">{stats?.eventsToday ?? 0}</p>
                                )}
                            </div>
                            <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                <p className="text-xs text-eventcontent/65">Account Plan</p>
                                {isPending ? (
                                    <Skeleton className="mt-1 h-8 w-16" />
                                ) : (
                                    <p className="text-2xl font-semibold">{accountPlan}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {invitations.length > 0 && (
                        <div className="mb-6 space-y-2">
                            <h2 className="text-sm font-semibold flex items-center gap-1.5">
                                Pending Invitations
                            </h2>
                            {invitations.map((inv) => (
                                <div
                                    key={inv.id}
                                    className="flex items-center justify-between gap-3 rounded-lg bg-card px-4 py-3 "
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <Avatar className="size-8 shrink-0">
                                            <AvatarImage src={inv.invitedBy.image ?? undefined} />
                                            <AvatarFallback className="text-xs">
                                                {inv.invitedBy.name.charAt(0).toUpperCase()}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="min-w-0">
                                            <p className="text-sm font-medium text-white truncate">
                                                {inv.project.name}
                                            </p>
                                            <p className="text-xs text-eventcontent/60 truncate">
                                                Invited by {inv.invitedBy.name} as a {inv.role.toLowerCase()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                        <Button
                                            size="sm"
                                            variant="secondary"
                                            className="cursor-pointer"
                                            disabled={decliningId === inv.id || acceptingId === inv.id}
                                            onClick={() => declineInvitation(inv.token, inv.id)}
                                        >
                                            {decliningId === inv.id ? "Declining..." : "Decline"}
                                        </Button>
                                        <Button
                                            size="sm"
                                            className="cursor-pointer"
                                            disabled={acceptingId === inv.id || decliningId === inv.id}
                                            onClick={() => acceptInvitation(inv.token, inv.id)}
                                        >
                                            {acceptingId === inv.id ? "Accepting..." : "Accept"}
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <div className="space-y-5">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Projects</h2>
                            <Link href="/settings/projects/new-project">
                                <Button size="sm" className="cursor-pointer gap-1.5" disabled={!canCreateProject}>
                                    <Plus className="size-3.5" />
                                    New Project
                                </Button>
                            </Link>
                        </div>

                        {isLoading ? (
                            <div className="space-y-2">
                                <Skeleton className="h-12 rounded-lg" />
                                <Skeleton className="h-12 rounded-lg" />
                                <Skeleton className="h-12 rounded-lg" />
                            </div>
                        ) : projects.length === 0 ? (
                            <div className="rounded-lg bg-card p-6 ring-1 ring-white/5 text-center">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyMedia variant="icon">
                                            <Folder />
                                        </EmptyMedia>
                                        <EmptyTitle>No Projects Yet</EmptyTitle>
                                        <EmptyDescription>
                                            Create your first project to start tracking events.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                    <Button asChild size="sm" className="mt-2">
                                        <Link href="/settings/projects/new-project">
                                            Create Project <ArrowUpRightIcon className="size-3.5" />
                                        </Link>
                                    </Button>
                                </Empty>
                            </div>
                        ) : (
                            <>
                                {ownedProjects.length > 0 && (
                                    <section>
                                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-eventcontent/65">
                                            My Projects
                                        </h3>
                                        {renderProjectTable(ownedProjects)}
                                    </section>
                                )}

                                {invitedProjects.length > 0 && (
                                    <section>
                                        <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-eventcontent/65">
                                            Invited Projects
                                        </h3>
                                        {renderProjectTable(invitedProjects)}
                                    </section>
                                )}
                            </>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}
