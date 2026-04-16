"use client";

import { use, useEffect, useState } from "react";
import { authClient } from "@/client/auth";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import ProjectNav from "@/components/project-nav";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { Settings, Copy, Check } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import Link from "next/link";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    Cell,
} from "recharts";

interface PageProps {
    params: Promise<{ id: string }>;
}

type AnalyticsData = {
    dailyEvents: { date: string; count: number }[];
    categoryBreakdown: { category: string; count: number }[];
    totalEvents: number;
    eventsToday: number;
    eventsThisWeek: number;
};

type ProjectInfo = {
    id: string;
    name: string;
};

const CHART_COLORS = ["#186DDC", "#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe", "#eff6ff", "#1d4ed8", "#1e40af", "#1e3a8a"];

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
    if (active && payload?.length) {
        return (
            <div className="rounded-lg bg-card px-3 py-2 text-xs ring-1 ring-white/10 shadow-lg">
                <p className="text-eventcontent/65 mb-0.5">{label}</p>
                <p className="font-semibold text-white">{payload[0]?.value} events</p>
            </div>
        );
    }
    return null;
};

const CategoryTooltip = ({ active, payload }: { active?: boolean; payload?: { value: number; payload: { category: string } }[] }) => {
    if (active && payload?.length) {
        return (
            <div className="rounded-lg bg-card px-3 py-2 text-xs ring-1 ring-white/10 shadow-lg">
                <p className="text-eventcontent/65 mb-0.5 capitalize">{payload[0]?.payload.category}</p>
                <p className="font-semibold text-white">{payload[0]?.value} events</p>
            </div>
        );
    }
    return null;
};

export default function Page({ params }: PageProps) {
    const { id } = use(params);
    const { data: session, isPending } = authClient.useSession();
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedId, setCopiedId] = useState(false);

    useEffect(() => {
        async function load() {
            setIsLoading(true);
            try {
                const [analyticsRes, projectRes] = await Promise.all([
                    fetch(`/api/v1/project/${id}/analytics`),
                    fetch(`/api/v1/project/${id}`),
                ]);
                if (analyticsRes.ok) {
                    const data = (await analyticsRes.json()) as AnalyticsData;
                    setAnalytics(data);
                }
                if (projectRes.ok) {
                    const data = (await projectRes.json()) as { project?: ProjectInfo | null };
                    if (data.project) {
                        setProjectInfo(data.project);
                        document.title = `${data.project.name} Analytics — Upstream`;
                    }
                }
            } finally {
                setIsLoading(false);
            }
        }
        load();
        return () => { document.title = "Upstream"; };
    }, [id]);

    async function copyProjectId() {
        await navigator.clipboard.writeText(id);
        setCopiedId(true);
        setTimeout(() => setCopiedId(false), 2000);
    }

    if (isPending) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-white">
                <Navbar user={{}} />
                <main className="flex-1 px-4 pb-6 sm:px-6">
                    <div className="mx-auto w-full max-w-2xl pt-6 space-y-4">
                        <Skeleton className="h-4 w-48" />
                        <Skeleton className="h-9 w-48" />
                        <div className="grid grid-cols-3 gap-3">
                            <Skeleton className="h-16 rounded-lg" />
                            <Skeleton className="h-16 rounded-lg" />
                            <Skeleton className="h-16 rounded-lg" />
                        </div>
                        <Skeleton className="h-56 rounded-xl" />
                        <Skeleton className="h-56 rounded-xl" />
                    </div>
                </main>
            </div>
        );
    }

    if (!session) redirect("/login");

    return (
        <div className="flex min-h-screen flex-col bg-background text-white">
            <Navbar
                user={{
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image || "",
                }}
            />

            <main className="flex-1 px-4 pb-6 sm:px-6">
                <div className="mx-auto w-full max-w-2xl">
                    <div className="pt-5 mb-4">
                        <Breadcrumb className="mb-3">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink asChild>
                                        <Link href="/">Dashboard</Link>
                                    </BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator />
                                <BreadcrumbItem>
                                    <BreadcrumbPage>
                                        {projectInfo?.name ?? <Skeleton className="inline-block h-4 w-24" />}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <h1 className="text-3xl font-semibold tracking-tight truncate">
                                    {projectInfo?.name ?? "Analytics"}
                                </h1>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={copyProjectId}
                                            className="shrink-0 rounded-md p-1 text-eventcontent/40 hover:text-eventcontent/80 transition-colors cursor-pointer"
                                        >
                                            {copiedId ? <Check className="size-4" /> : <Copy className="size-4" />}
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent side="right">
                                        {copiedId ? "Copied!" : "Copy project ID"}
                                    </TooltipContent>
                                </Tooltip>
                            </div>
                            <Link href={`/settings/projects/${id}`}>
                                <Button variant="secondary" size="sm" className="cursor-pointer gap-1.5">
                                    <Settings className="size-3.5" />
                                    Settings
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <ProjectNav projectId={id} projectName={projectInfo?.name} />

                    {isLoading ? (
                        <div className="space-y-4">
                            <div className="grid grid-cols-3 gap-3">
                                <Skeleton className="h-16 rounded-lg" />
                                <Skeleton className="h-16 rounded-lg" />
                                <Skeleton className="h-16 rounded-lg" />
                            </div>
                            <Skeleton className="h-56 rounded-xl" />
                            <Skeleton className="h-56 rounded-xl" />
                        </div>
                    ) : analytics ? (
                        <div className="space-y-5">
                            {/* Stat cards */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                    <p className="text-xs text-eventcontent/65">Total Events</p>
                                    <p className="text-2xl font-bold">{analytics.totalEvents.toLocaleString()}</p>
                                </div>
                                <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                    <p className="text-xs text-eventcontent/65">This Week</p>
                                    <p className="text-2xl font-bold">{analytics.eventsThisWeek.toLocaleString()}</p>
                                </div>
                                <div className="rounded-lg bg-card p-3 ring-1 ring-white/5">
                                    <p className="text-xs text-eventcontent/65">Today</p>
                                    <p className="text-2xl font-bold">{analytics.eventsToday.toLocaleString()}</p>
                                </div>
                            </div>

                            {/* Daily events chart */}
                            <div className="rounded-xl bg-card p-4 ring-1 ring-white/5">
                                <p className="mb-4 text-sm font-semibold text-white">Events — Last 30 Days</p>
                                {analytics.dailyEvents.every((d) => d.count === 0) ? (
                                    <p className="py-8 text-center text-sm text-eventcontent/55">No events in the last 30 days.</p>
                                ) : (
                                    <ResponsiveContainer width="100%" height={200}>
                                        <BarChart data={analytics.dailyEvents} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                            <XAxis
                                                dataKey="date"
                                                tick={{ fill: "rgba(229,226,225,0.45)", fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={false}
                                                interval={4}
                                            />
                                            <YAxis
                                                tick={{ fill: "rgba(229,226,225,0.45)", fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                            />
                                            <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                                            <Bar dataKey="count" fill="#186DDC" radius={[3, 3, 0, 0]} maxBarSize={32} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                )}
                            </div>

                            {/* Category breakdown chart */}
                            {analytics.categoryBreakdown.length > 0 && (
                                <div className="rounded-xl bg-card p-4 ring-1 ring-white/5">
                                    <p className="mb-4 text-sm font-semibold text-white">Events by Category</p>
                                    <ResponsiveContainer width="100%" height={Math.max(160, analytics.categoryBreakdown.length * 36)}>
                                        <BarChart
                                            data={analytics.categoryBreakdown}
                                            layout="vertical"
                                            margin={{ top: 0, right: 16, bottom: 0, left: 0 }}
                                        >
                                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                                            <XAxis
                                                type="number"
                                                tick={{ fill: "rgba(229,226,225,0.45)", fontSize: 10 }}
                                                tickLine={false}
                                                axisLine={false}
                                                allowDecimals={false}
                                            />
                                            <YAxis
                                                dataKey="category"
                                                type="category"
                                                tick={{ fill: "rgba(229,226,225,0.65)", fontSize: 11 }}
                                                tickLine={false}
                                                axisLine={false}
                                                width={90}
                                            />
                                            <RechartsTooltip content={<CategoryTooltip />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
                                            <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={20}>
                                                {analytics.categoryBreakdown.map((_, index) => (
                                                    <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                ))}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-eventcontent/55">Could not load analytics.</p>
                    )}
                </div>
            </main>
        </div>
    );
}
