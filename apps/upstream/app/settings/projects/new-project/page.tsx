"use client";

import { authClient } from "@/client/auth"
import { redirect } from "next/navigation";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Folder, GalleryVerticalEnd, Settings } from "lucide-react";
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
import Link from "next/link";

export default function Page() {
    const { data: session, isPending } = authClient.useSession();
    const [projectName, setProjectName] = useState("");
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
    }

    async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setError("");

        const trimmedName = projectName.trim();

        if (!trimmedName) {
            setError("Project name is required.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/v1/project", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
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

                        <form onSubmit={onSubmit} className="space-y-4">
                            <div>
                                <Label htmlFor="project-name" className="mb-1 text-eventcontent/75">
                                    Project Name
                                </Label>
                                <Input
                                    id="project-name"
                                    placeholder="Kang Software"
                                    className="bg-background/40 text-white"
                                    value={projectName}
                                    onChange={(event) => setProjectName(event.target.value)}
                                    maxLength={80}
                                    disabled={isSubmitting}
                                />
                            </div>

                            {error ? (
                                <p className="text-sm text-red-300">{error}</p>
                            ) : null}

                            <div className="flex items-center justify-end gap-2">
                                <Button type="button" variant="secondary" asChild disabled={isSubmitting}>
                                    <Link className="cursor-pointer" href="/">Cancel</Link>
                                </Button>
                                <Button className="cursor-pointer" type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Creating..." : "Create Project"}
                                </Button>
                            </div>
                        </form>
                    </section>


                </div>
            </main>
        </div>
    )
}
