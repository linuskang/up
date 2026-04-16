"use client";

import { authClient } from "@/client/auth"
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Skeleton } from "@workspace/ui/components/skeleton";
import Link from "next/link";

type ProjectLimits = {
    maxProjects: number;
    usedProjects: number;
    remainingProjects: number;
    canCreateProject: boolean;
};

export default function Page() {
    const { data: session, isPending } = authClient.useSession();
    const [projectName, setProjectName] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [limits, setLimits] = useState<ProjectLimits | null>(null);
    const [isLoadingLimits, setIsLoadingLimits] = useState(true);
    const router = useRouter();

    // Always run hooks before any conditional returns
    useEffect(() => {
        let isCancelled = false;

        async function loadLimits() {
            try {
                const response = await fetch("/api/v1/project", { method: "GET" });
                if (!response.ok) return;
                const data = (await response.json()) as { limits?: ProjectLimits };
                if (!isCancelled) setLimits(data.limits ?? null);
            } finally {
                if (!isCancelled) setIsLoadingLimits(false);
            }
        }

        loadLimits();
        return () => { isCancelled = true; };
    }, []);

    if (isPending) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-white">
                <Navbar user={{}} />
                <main className="flex-1 flex justify-center">
                    <div className="w-full max-w-2xl p-6 space-y-4">
                        <Skeleton className="h-4 w-64" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>
                </main>
            </div>
        );
    }

    if (!session) {
        redirect("/login");
    }

    const canCreateProject = limits?.canCreateProject ?? true;

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const trimmedName = projectName.trim();

        if (!trimmedName) {
            setError("Project name is required.");
            return;
        }

        if (!canCreateProject) {
            setError("Project limit reached. Upgrade your plan to create more projects.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/v1/project", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: trimmedName }),
            });

            const data = (await response.json()) as { error?: string };

            if (!response.ok) {
                setError(data.error || "Failed to create project.");
                return;
            }

            router.push("/");
            router.refresh();
        } catch {
            setError("Could not connect to the server. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
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
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/settings">Settings</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/settings/projects">Manage Projects</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Create Project</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <section className="rounded-xl bg-card p-4 ring-1 ring-white/5">
                        <h1 className="mb-1 text-2xl font-semibold text-white">Create Project</h1>
                        <p className="mb-5 text-sm text-eventcontent/70">
                            Create a new project and start logging your events.
                        </p>

                        {!isLoadingLimits && limits && (
                            <div className="mb-4 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                                <span className="text-xs text-eventcontent/65">Projects used</span>
                                <span className="text-xs font-semibold text-white">
                                    {limits.usedProjects}/{limits.maxProjects}
                                </span>
                            </div>
                        )}

                        {!canCreateProject && (
                            <div className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-xs text-destructive">
                                You&apos;ve reached your project limit.{" "}
                                <Link href="/settings/plan" className="font-semibold underline underline-offset-2">
                                    Upgrade your plan
                                </Link>{" "}
                                to create more.
                            </div>
                        )}

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="project-name" className="mb-1 text-eventcontent/75">
                                    Project Name
                                </Label>
                                <Input
                                    id="project-name"
                                    placeholder="My App"
                                    className="bg-background/40 text-white"
                                    value={projectName}
                                    onChange={(e) => setProjectName(e.target.value)}
                                    maxLength={80}
                                    disabled={isSubmitting || !canCreateProject}
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <p className="text-sm text-destructive">{error}</p>
                            )}

                            <div className="flex items-center justify-end gap-2">
                                <Button type="button" variant="secondary" asChild disabled={isSubmitting}>
                                    <Link href="/settings/projects">Cancel</Link>
                                </Button>
                                <Button
                                    className="cursor-pointer"
                                    type="submit"
                                    disabled={isSubmitting || !canCreateProject || !projectName.trim()}
                                >
                                    {isSubmitting ? "Creating..." : "Create Project"}
                                </Button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}
