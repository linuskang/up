"use client";

import { authClient } from "@/client/auth";
import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Check, Zap } from "lucide-react";
import { useEffect, useState } from "react";

type ProjectLimits = {
    maxProjects: number;
    usedProjects: number;
    remainingProjects: number;
    canCreateProject: boolean;
};

const HOBBY_FEATURES = [
    "Up to 3 projects",
    "Unlimited events",
    "7 days data retention",
    "Team members",
    "Audit logs",
    "Event Webhooks",
];

const PRO_FEATURES = [
    "Everything in Hobby, plus:",
    "Up to 10 projects",
    "31 days data retention",
];

export default function Page() {
    const { data: session, isPending } = authClient.useSession();
    const [limits, setLimits] = useState<ProjectLimits | null>(null);

    useEffect(() => {
        let isCancelled = false;

        async function loadLimits() {
            const response = await fetch("/api/v1/project");
            if (!response.ok) return;
            const data = (await response.json()) as { limits?: ProjectLimits };
            if (!isCancelled) setLimits(data.limits ?? null);
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
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-28 rounded-xl" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-64 rounded-xl" />
                            <Skeleton className="h-64 rounded-xl" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!session) {
        redirect("/login");
    }

    const accountPlan = (session.user as { accountPlan?: string }).accountPlan || "Hobby";
    const isHobby = accountPlan === "Hobby";

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
                <div className="w-full max-w-2xl p-6 overflow-auto space-y-6">
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/settings">Settings</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Account Plan</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    {/* Current usage */}
                    <section className="rounded-xl bg-card p-4 ring-1 ring-white/5">
                        <p className="text-xs text-eventcontent/65 mb-3 uppercase tracking-wide font-semibold">
                            Current Usage
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs text-eventcontent/65">Active Plan</p>
                                <p className="text-lg font-semibold text-white flex items-center gap-1.5">
                                    {accountPlan}
                                </p>
                            </div>
                            {limits && (
                                <div>
                                    <p className="text-xs text-eventcontent/65">Projects</p>
                                    <p className="text-lg font-semibold text-white">
                                        {limits.usedProjects}
                                        <span className="text-sm text-eventcontent/60 font-normal">
                                            /{limits.maxProjects}
                                        </span>
                                    </p>
                                    <div className="mt-1 h-1.5 w-full rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-white transition-all"
                                            style={{ width: `${Math.min(100, (limits.usedProjects / limits.maxProjects) * 100)}%` }}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Plan comparison */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Hobby */}
                        <div className={`rounded-xl p-5 ring-1 ${isHobby ? "bg-card ring-white" : "bg-card ring-white/5"}`}>
                            <div className="flex items-start justify-between mb-1">
                                <p className="text-base font-semibold text-white">Hobby</p>
                                {isHobby && (
                                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wide">
                                        Current
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold mb-1">Free</p>
                            <p className="text-xs text-eventcontent/60 mb-4">For side projects and personal use.</p>
                            <ul className="space-y-2">
                                {HOBBY_FEATURES.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-eventcontent/80">
                                        <Check className="size-3.5 text-white shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Pro */}
                        <div className={`rounded-xl p-5 ring-1 ${!isHobby ? "bg-card ring-white/50" : "bg-card ring-white/5"}`}>
                            <div className="flex items-start justify-between mb-1">
                                <p className="text-base font-semibold text-white flex items-center gap-1.5">
                                    Pro
                                </p>
                                {!isHobby && (
                                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wide">
                                        Current
                                    </span>
                                )}
                            </div>
                            <p className="text-2xl font-bold mb-1">Contact Sales</p>
                            <p className="text-xs text-eventcontent/60 mb-4">For teams that need more power.</p>
                            <ul className="space-y-2 mb-5">
                                {PRO_FEATURES.map((f) => (
                                    <li key={f} className="flex items-center gap-2 text-sm text-eventcontent/80">
                                        <Check className="size-3.5 text-white shrink-0" />
                                        {f}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
