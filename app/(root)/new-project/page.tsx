"use client";

// Libraries
import { authClient } from "@/client/auth"
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";

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

export default function Page() {
    const { data: session, isPending } = authClient.useSession();

    // States
    const [projectName, setProjectName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

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

    async function create(e: React.FormEvent) {
        e.preventDefault();
        setIsSubmitting(true);

        const response = await fetch("/api/project", {
            method: "POST",

            headers: {
                "Content-Type": "application/json",
            },

            body: JSON.stringify(
                {
                    name: projectName,
                }
            )
        })

        if (response.ok) {
            const d = await response.json();
            toast.success("Project created successfully!");
            window.location.href = `/project/${d.projectId}`;

        } else {
            const msg = await response.json();
            toast.error(msg.error);
            setIsSubmitting(false);
        }
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

            <Card className="bg-card ring-0">
                <CardHeader>
                    <CardTitle className="text-2xl font-semibold text-white">Create Project</CardTitle>
                    <CardDescription>
                        Create a new project and start logging your events.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={create} id="create-project-form" className="space-y-4">
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
        </div>
    );
}
