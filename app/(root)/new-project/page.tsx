"use client";

// Libraries
import { authClient } from "@/client/auth"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

// Components
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

type ProjectLimits = {
    maxProjects: number;
    usedProjects: number;
    remainingProjects: number;
    canCreateProject: boolean;
};

function CreateProjectForm() {
    const [projectName, setProjectName] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [limits, setLimits] = useState<ProjectLimits | null>(null);
    const [isLoadingLimits, setIsLoadingLimits] = useState(true);
    const router = useRouter();

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

    return (
        <Card className="bg-card ring-0">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-white">Create Project</CardTitle>
                <CardDescription>
                    Create a new project and start logging your events.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form id="create-project-form" className="space-y-4">
                    {!isLoadingLimits && limits && (
                        <div className="mb-4 flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                            <span className="text-xs text-muted-foreground">Projects used</span>
                            <span className="text-xs font-semibold text-white">
                                {limits.usedProjects}/{limits.maxProjects}
                            </span>
                        </div>
                    )}

                    <div>
                        <Label htmlFor="project-name" className="mb-2">
                            Project Name
                        </Label>
                        <Input
                            id="project-name"
                            placeholder="My App"
                            className="bg-input border-0 text-white"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            maxLength={80}
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-destructive">{error}</p>
                    )}
                </form>
            </CardContent>
            <CardFooter className="justify-end gap-2">
                <Button type="button" variant="secondary" asChild disabled={isSubmitting}>
                    <Link href="/settings/projects">Cancel</Link>
                </Button>
                <Button
                    className="cursor-pointer"
                    type="submit"
                    form="create-project-form"
                >
                    {isSubmitting ? "Creating..." : "Create Project"}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function Page() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div className="flex min-h-svh flex-col gap-8 py-6">
                <div className="flex flex-col gap-1">
                    <Breadcrumb>
                        <BreadcrumbList className="text-sm">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">Dashboard</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Create Project</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <Card className="bg-card ring-0">
                    <CardHeader>
                        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                        <div className="h-4 w-72 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="h-10 w-full animate-pulse rounded bg-muted" />
                    </CardContent>
                    <CardFooter className="justify-end gap-2">
                        <div className="h-9 w-20 animate-pulse rounded bg-muted" />
                        <div className="h-9 w-32 animate-pulse rounded bg-muted" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

    if (!session) {
        return null;
    }

    return (
        <div className="flex min-h-svh flex-col gap-8 py-6">
            <div className="flex flex-col gap-1">
                <Breadcrumb>
                    <BreadcrumbList className="text-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Dashboard</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Create Project</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <CreateProjectForm />
        </div>
    );
}
