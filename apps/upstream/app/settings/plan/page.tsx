"use client";

import { authClient } from "@/client/auth";
import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";

type ProjectLimits = {
    maxProjects: number;
    usedProjects: number;
    remainingProjects: number;
    canCreateProject: boolean;
};

export default function Page() {
    const { data: session, isPending } = authClient.useSession();
    const [limits, setLimits] = useState<ProjectLimits | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function loadLimits() {
            const response = await fetch("/api/v1/project", { method: "GET" });

            if (!response.ok) {
                return;
            }

            const data = (await response.json()) as { limits?: ProjectLimits };

            if (!isCancelled) {
                setLimits(data.limits ?? null);
            }
        }

        loadLimits();

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
                                <BreadcrumbPage>Billing</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <section className="rounded-xl bg-card p-4 ring-1 ring-white/5">

                        <div className="space-y-3">
                            <div>
                                <p className="text-xs text-eventcontent/65">Current Plan</p>
                                <p className="text-lg font-semibold text-white">{accountPlan}</p>
                            </div>
                            {limits && (
                                <div>
                                    <p className="text-xs text-eventcontent/65">Project Limit</p>
                                    <p className="text-lg font-semibold text-white">
                                        {limits.usedProjects}/{limits.maxProjects}
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
}
