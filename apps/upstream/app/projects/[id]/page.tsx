"use client";

import { useEffect, useMemo, use, useState, type ComponentProps } from "react";
import { authClient } from "@/client/auth";
import { redirect } from "next/navigation";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { Folder, GalleryVerticalEnd, Search, Settings } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/navbar";
import Event from "@/components/event";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";

interface PageProps {
    params: Promise<{ id: string }>;
}

const allEvents: ComponentProps<typeof Event>[] = [
    {
        title: "Production deploy completed",
        icon: "🚀",
        time: "11:58 pm",
        category: "deploy.status",
        content: "Version v2.14.0 was deployed to production.",
        fields: [
            { name: "Commit", value: "a7f13b2" },
            { name: "Duration", value: "4m 21s" },
        ],
        actions: [
            { label: "View release", type: "primary", url: "#" },
            { label: "View logs", type: "secondary", url: "#" },
        ],
    },
    {
        title: "Error budget alert",
        icon: "📉",
        time: "11:49 pm",
        category: "incident.ops",
        content: "Service checkout-api consumed 82% of its weekly error budget.",
        fields: [
            { name: "SLO", value: "99.9%" },
            { name: "Window", value: "7d" },
        ],
        data: { service: "checkout-api", consumed: 0.82, target: 0.999 },
    },
    {
        title: "Webhook delivery failed",
        icon: "🪝",
        time: "11:41 pm",
        category: "webhook.delivery",
        content: "Stripe webhook failed with 429. Auto retry has been scheduled.",
        fields: [
            { name: "Endpoint", value: "/api/webhooks/stripe" },
            { name: "Retry in", value: "60s" },
        ],
        actions: [
            { label: "Retry now", type: "primary", url: "#" },
            { label: "Open endpoint", type: "secondary", url: "#" },
        ],
    },
    {
        title: "Data export finished",
        icon: "📦",
        time: "11:29 pm",
        category: "data.export",
        content: "Nightly event archive export completed.",
        fields: [
            { name: "Rows", value: "1,823,442" },
            { name: "Size", value: "1.4 GB" },
        ],
    },
    {
        title: "Suspicious login blocked",
        icon: "🛡️",
        time: "11:11 pm",
        category: "security.alert",
        content: "Blocked login attempt from a new country and unknown device fingerprint.",
        fields: [
            { name: "IP", value: "198.51.100.44" },
            { name: "Location", value: "Warsaw, PL" },
        ],
        actions: [
            { label: "Review activity", type: "primary", url: "#" },
            { label: "Force reset", type: "secondary", url: "#" },
        ],
    },
    {
        title: "Usage threshold reached",
        icon: "📊",
        time: "10:58 pm",
        category: "usage.threshold",
        content: "Project crossed 90% of monthly event quota.",
        fields: [
            { name: "Current", value: "9.1M" },
            { name: "Limit", value: "10M" },
        ],
    },
    {
        title: "Slack integration disconnected",
        icon: "🔌",
        time: "10:42 pm",
        category: "integrations.slack",
        content: "Bot token was revoked. Notifications to #alerts are paused.",
        actions: [{ label: "Reconnect", type: "primary", url: "#" }],
    },
    {
        title: "Database migration applied",
        icon: "🧱",
        time: "10:33 pm",
        category: "db.migration",
        content: "Migration 20260410102500_add_event_indexes executed successfully.",
        fields: [
            { name: "Rows touched", value: "0" },
            { name: "Rollback", value: "Available" },
        ],
    },
    {
        title: "Backfill worker started",
        icon: "🧵",
        time: "10:25 pm",
        category: "jobs.worker",
        content: "Backfill for historical events initiated.",
        events: [
            { icon: "1/3", time: "10:26 pm", content: "Queued partitions" },
            { icon: "2/3", time: "10:27 pm", content: "Started processing" },
            { icon: "3/3", time: "10:30 pm", content: "Checkpoint persisted" },
        ],
    },
    {
        title: "API error spike detected",
        icon: "🚨",
        time: "10:15 pm",
        category: "api.errors",
        content: "Error rate crossed 5% for /v1/project endpoint.",
        fields: [
            { name: "Status", value: "500" },
            { name: "Count", value: "128" },
        ],
        data: { endpoint: "/v1/project", threshold: 0.05, observed: 0.079 },
    },
    {
        title: "Feature flag changed",
        icon: "🚩",
        time: "10:09 pm",
        category: "feature.flags",
        content: "Flag new-signup-flow set to 30% rollout.",
        fields: [
            { name: "Environment", value: "production" },
            { name: "Changed by", value: "linus@company.com" },
        ],
    },
    {
        title: "User login blocked",
        icon: "⚠️",
        time: "10:01 pm",
        category: "auth.login",
        content: "Blocked suspicious sign-in from unknown location.",
        fields: [
            { name: "IP", value: "203.0.113.12" },
            { name: "Location", value: "Tokyo, JP" },
        ],
        actions: [{ label: "Review session", type: "primary", url: "#" }],
    },
    {
        title: "CDN cache purged",
        icon: "🧹",
        time: "09:54 pm",
        category: "infra.cdn",
        content: "Invalidated /assets/* after image optimization rollout.",
    },
    {
        title: "User login succeeded",
        icon: "✅",
        time: "09:35 pm",
        category: "auth.login",
        content: "User signed in with passkey.",
        fields: [
            { name: "Method", value: "passkey" },
            { name: "Device", value: "Chrome / Windows" },
        ],
    },
    {
        title: "Payment retry scheduled",
        icon: "🔁",
        time: "09:20 pm",
        category: "cron.billing",
        content: "3 failed charges queued for retry.",
        fields: [
            { name: "Queue", value: "billing-retry" },
            { name: "Backoff", value: "15m" },
        ],
    },
    {
        title: "Billing job completed",
        icon: "💸",
        time: "09:04 pm",
        category: "cron.billing",
        content: "Daily invoice generation finished with 42 new invoices.",
        fields: [
            { name: "Project", value: "checkout-api" },
            { name: "Region", value: "us-east-1" },
        ],
        data: { processed: 42, failed: 0, durationMs: 1382 },
    },
    {
        title: "Build cache warmed",
        icon: "🧊",
        time: "08:58 pm",
        category: "ci.build",
        content: "Remote cache primed for 14 packages.",
        fields: [
            { name: "Runner", value: "gh-actions" },
            { name: "Cache hit", value: "92%" },
        ],
    },
    {
        title: "PagerDuty incident acknowledged",
        icon: "📟",
        time: "08:49 pm",
        category: "incident.ops",
        content: "Incident INC-2481 acknowledged by on-call engineer.",
        fields: [
            { name: "Priority", value: "P2" },
            { name: "Service", value: "checkout-api" },
        ],
    },
    {
        title: "Kafka lag recovered",
        icon: "🛰️",
        time: "08:41 pm",
        category: "streaming.kafka",
        content: "Consumer lag on topic events.ingest returned to healthy range.",
        fields: [
            { name: "Before", value: "42,188" },
            { name: "After", value: "211" },
        ],
    },
    {
        title: "Token rotated",
        icon: "🗝️",
        time: "08:36 pm",
        category: "security.keys",
        content: "Project ingestion token rotated successfully.",
        actions: [{ label: "View key", type: "primary", url: "#" }],
    },
    {
        title: "Read replica promoted",
        icon: "🗄️",
        time: "08:30 pm",
        category: "db.replication",
        content: "Read replica us-east-1b promoted after failover drill.",
        fields: [
            { name: "RTO", value: "38s" },
            { name: "Result", value: "Pass" },
        ],
    },
    {
        title: "Schema drift detected",
        icon: "🧬",
        time: "08:22 pm",
        category: "db.schema",
        content: "Column metadata mismatch detected between staging and production.",
        actions: [
            { label: "Compare schemas", type: "primary", url: "#" },
            { label: "Ignore", type: "secondary", url: "#" },
        ],
    },
    {
        title: "Login rate limit triggered",
        icon: "🚧",
        time: "08:16 pm",
        category: "auth.login",
        content: "Rate limit triggered for IP 172.16.9.12 after 40 attempts.",
        fields: [
            { name: "Window", value: "5m" },
            { name: "Action", value: "Block 30m" },
        ],
    },
    {
        title: "Cost anomaly detected",
        icon: "💹",
        time: "08:08 pm",
        category: "billing.cost",
        content: "Unexpected 27% spend increase in data egress.",
        fields: [
            { name: "Service", value: "CDN" },
            { name: "Delta", value: "+$1,204" },
        ],
        data: { baselineUsd: 4421, currentUsd: 5625, deltaPct: 0.27 },
    },
    {
        title: "Canary failed health check",
        icon: "🐤",
        time: "07:59 pm",
        category: "deploy.status",
        content: "Canary instance returned elevated 5xx responses.",
        events: [
            { icon: "1", time: "08:00 pm", content: "Auto pause enabled" },
            { icon: "2", time: "08:01 pm", content: "Rollback initiated" },
            { icon: "3", time: "08:04 pm", content: "Baseline restored" },
        ],
    },
    {
        title: "Email provider latency",
        icon: "📨",
        time: "07:52 pm",
        category: "integrations.email",
        content: "Transactional email latency exceeded 2s p95.",
        fields: [
            { name: "Provider", value: "Postmark" },
            { name: "p95", value: "2.4s" },
        ],
    },
    {
        title: "Org member invited",
        icon: "👥",
        time: "07:45 pm",
        category: "account.team",
        content: "sam@company.com invited as MEMBER to this project.",
        actions: [{ label: "Manage members", type: "primary", url: "#" }],
    },
    {
        title: "Session revoked",
        icon: "⛔",
        time: "07:38 pm",
        category: "security.session",
        content: "A stale admin session was revoked after policy update.",
        fields: [
            { name: "User", value: "admin@company.com" },
            { name: "Reason", value: "Policy changed" },
        ],
    },
    {
        title: "Backup verification succeeded",
        icon: "✅",
        time: "07:29 pm",
        category: "backup.verify",
        content: "Automated restore test completed successfully.",
        fields: [
            { name: "Snapshot", value: "snap-01HX2" },
            { name: "Duration", value: "7m 13s" },
        ],
    },
    {
        title: "Queue depth warning",
        icon: "📬",
        time: "07:21 pm",
        category: "jobs.worker",
        content: "Queue ingest-high reached warning threshold.",
        fields: [
            { name: "Depth", value: "19,200" },
            { name: "Threshold", value: "15,000" },
        ],
    },
    {
        title: "Synthetic check failed",
        icon: "🧪",
        time: "07:14 pm",
        category: "monitoring.synthetic",
        content: "GET /health failed from eu-west probe region.",
        actions: [
            { label: "Open monitor", type: "primary", url: "#" },
            { label: "Silence 30m", type: "secondary", url: "#" },
        ],
    },
];

const EVENTS_PER_PAGE = 15;

export default function Page({ params }: PageProps) {
    const { id } = use(params);
    const { data: session, isPending } = authClient.useSession();
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    const categories = useMemo(() => {
        const derived = Array.from(
            new Set(
                allEvents
                    .map((event) => event.category)
                    .filter((category): category is string => Boolean(category))
            )
        );

        return ["all", ...derived];
    }, []);

    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const filteredEvents = useMemo(() => {
        return allEvents.filter((event) => {
            const inCategory = selectedCategory === "all" || event.category === selectedCategory;
            const inSearch = `${event.title} ${event.content ?? ""}`
                .toLowerCase()
                .includes(search.toLowerCase());
            return inCategory && inSearch;
        });
    }, [search, selectedCategory]);

    const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedCategory]);

    useEffect(() => {
        if (currentPage > totalPages) {
            setCurrentPage(totalPages);
        }
    }, [currentPage, totalPages]);

    const pagedEvents = useMemo(() => {
        const start = (currentPage - 1) * EVENTS_PER_PAGE;
        return filteredEvents.slice(start, start + EVENTS_PER_PAGE);
    }, [filteredEvents, currentPage]);

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-white">
            <Navbar
                navItems={[
                    { label: "Projects", path: "/", icon: Folder },
                    { label: "Events", path: "/events", icon: GalleryVerticalEnd },
                    { label: "Settings", path: "/settings", icon: Settings },
                ]}
                user={{
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image || "",
                }}
            />

            <main className="flex-1 px-4 pb-6 pt-4 sm:px-6">
                <div className="mx-auto w-full max-w-2xl">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">Project</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href={`/projects/${id}`}>kng</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="mb-4 flex items-center gap-2">
                        <h1 className="text-3xl font-semibold tracking-tight">Events</h1>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(11rem,max-content)_1fr] lg:items-start">
                        <aside className="w-fit min-w-44 rounded-xl bg-card p-2 ring-1 ring-white/5">
                            <p className="mb-3 text-lg font-semibold">Categories</p>
                            <div className="flex flex-col gap-1.5">
                                {categories.map((category) => {
                                    const active = selectedCategory === category;
                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setSelectedCategory(category)}
                                            className={`rounded-md px-2 py-1 text-left text-sm transition ${
                                                active
                                                    ? "bg-white/10 text-white"
                                                    : "text-eventcontent/75 hover:bg-white/5 hover:text-white"
                                            }`}
                                        >
                                            {category}
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>

                        <section>
                            <div className="relative mb-4">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-eventcontent/55" />
                                <Input
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search for events"
                                    className="h-11 border-white/5 bg-card pl-9 text-white placeholder:text-eventcontent/45"
                                />
                            </div>

                            <div className="flex flex-col gap-3">
                                {pagedEvents.length > 0 ? (
                                    pagedEvents.map((event, index) => <Event key={`${event.title}-${index}`} {...event} />)
                                ) : (
                                    <div className="rounded-xl bg-card p-5 text-sm text-eventcontent/75 ring-1 ring-white/5">
                                        No events found for this category.
                                    </div>
                                )}
                            </div>

                            {filteredEvents.length > EVENTS_PER_PAGE && (
                                <div className="mt-4 flex items-center justify-between">
                                    <p className="text-sm text-eventcontent/75">
                                        Page {currentPage} of {totalPages}
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
                                        >
                                            Next
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </section>
                    </div>
                </div>
            </main>
        </div>
    );
}
