"use client";

import { useEffect, useMemo, use, useState, useRef, useCallback } from "react";
import { authClient } from "@/client/auth";
import { redirect } from "next/navigation";
import { Search, Settings, Copy, Check, RefreshCw } from "lucide-react";
import Navbar from "@/components/navbar";
import ProjectNav from "@/components/project-nav";
import Event from "@/components/event";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { Tooltip, TooltipContent, TooltipTrigger } from "@workspace/ui/components/tooltip";
import type { EventProps } from "@/types";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface PageProps {
    params: Promise<{ id: string }>;
}

type EventFromApi = {
    id: string;
    title: string;
    icon: string;
    time: string;
    content: string | null;
    category: string | null;
    fields: EventProps["fields"];
    events: EventProps["events"];
    actions: EventProps["actions"];
    data: unknown;
    createdAt: string;
};

type ProjectInfo = {
    id: string;
    name: string;
};

function toEventProps(event: EventFromApi): EventProps {
    return {
        title: event.title,
        icon: event.icon,
        time: formatDistanceToNow(new Date(event.createdAt), { addSuffix: true }),
        content: event.content || undefined,
        category: event.category || undefined,
        fields: Array.isArray(event.fields) ? event.fields : undefined,
        events: Array.isArray(event.events) ? event.events : undefined,
        actions: Array.isArray(event.actions) ? event.actions : undefined,
        data: event.data ?? undefined,
    };
}

const EVENTS_PER_PAGE = 15;
const REFRESH_INTERVAL_MS = 30_000;

export default function Page({ params }: PageProps) {
    const { id } = use(params);
    const { data: session, isPending } = authClient.useSession();
    const [events, setEvents] = useState<EventProps[]>([]);
    const [isEventsLoading, setIsEventsLoading] = useState(true);
    const [projectInfo, setProjectInfo] = useState<ProjectInfo | null>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [copiedId, setCopiedId] = useState(false);
    const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
    const searchInputRef = useRef<HTMLInputElement>(null);

    const loadEvents = useCallback(async (silent = false) => {
        if (!silent) setIsEventsLoading(true);

        try {
            const response = await fetch(`/api/v1/events?projectId=${id}&limit=100`);

            if (!response.ok) {
                setEvents([]);
                return;
            }

            const data = (await response.json()) as { events?: EventFromApi[] };
            setEvents((data.events || []).map(toEventProps));
            setLastRefreshed(new Date());
        } finally {
            if (!silent) setIsEventsLoading(false);
        }
    }, [id]);

    // Initial load
    useEffect(() => {
        loadEvents();
    }, [loadEvents]);

    // Auto-refresh every 30s
    useEffect(() => {
        const timer = setInterval(() => loadEvents(true), REFRESH_INTERVAL_MS);
        return () => clearInterval(timer);
    }, [loadEvents]);

    // Fetch project name + update document title
    useEffect(() => {
        async function loadProject() {
            const res = await fetch(`/api/v1/project/${id}`);
            if (!res.ok) return;
            const data = (await res.json()) as { project?: ProjectInfo | null };
            if (data.project) {
                setProjectInfo(data.project);
                document.title = `${data.project.name} — Upstream`;
            }
        }
        loadProject();
        return () => { document.title = "Upstream"; };
    }, [id]);

    // Keyboard shortcut: "/" focuses search
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            const tag = (e.target as HTMLElement).tagName;
            if (e.key === "/" && tag !== "INPUT" && tag !== "TEXTAREA") {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    const categoryCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        for (const event of events) {
            if (event.category) {
                counts[event.category] = (counts[event.category] ?? 0) + 1;
            }
        }
        return counts;
    }, [events]);

    const categories = useMemo(() => {
        return ["all", ...Object.keys(categoryCounts)];
    }, [categoryCounts]);

    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const filteredEvents = useMemo(() => {
        return events.filter((event) => {
            const inCategory = selectedCategory === "all" || event.category === selectedCategory;
            const inSearch = `${event.title} ${event.content ?? ""}`
                .toLowerCase()
                .includes(search.toLowerCase());
            return inCategory && inSearch;
        });
    }, [events, search, selectedCategory]);

    const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE));

    useEffect(() => { setCurrentPage(1); }, [search, selectedCategory]);

    useEffect(() => {
        if (currentPage > totalPages) setCurrentPage(totalPages);
    }, [currentPage, totalPages]);

    const pagedEvents = useMemo(() => {
        const start = (currentPage - 1) * EVENTS_PER_PAGE;
        return filteredEvents.slice(start, start + EVENTS_PER_PAGE);
    }, [filteredEvents, currentPage]);

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
                        <Skeleton className="h-11 w-full" />
                        <div className="space-y-3">
                            <Skeleton className="h-14 rounded-xl" />
                            <Skeleton className="h-14 rounded-xl" />
                            <Skeleton className="h-14 rounded-xl" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    if (!session) {
        redirect("/login");
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
                                        {projectInfo?.name ?? (
                                            <Skeleton className="inline-block h-4 w-24" />
                                        )}
                                    </BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>

                        <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 min-w-0">
                                <h1 className="text-3xl font-semibold tracking-tight truncate">
                                    {projectInfo?.name ?? "Events"}
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

                            <div className="flex items-center gap-2 shrink-0">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => loadEvents(true)}
                                            className="rounded-md p-1.5 text-eventcontent/40 hover:text-eventcontent/80 transition-colors cursor-pointer"
                                        >
                                            <RefreshCw className="size-4" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        Refresh · auto-refreshes every 30s
                                    </TooltipContent>
                                </Tooltip>
                                <Link href={`/settings/projects/${id}`}>
                                    <Button variant="secondary" size="sm" className="cursor-pointer gap-1.5">
                                        <Settings className="size-3.5" />
                                        Settings
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        {!isEventsLoading && events.length > 0 && (
                            <p className="mt-1 text-xs text-eventcontent/45">
                                {events.length} event{events.length !== 1 ? "s" : ""} · refreshed {formatDistanceToNow(lastRefreshed, { addSuffix: true })}
                            </p>
                        )}
                    </div>

                    <ProjectNav projectId={id} projectName={projectInfo?.name} />

                    <div className="grid gap-4 lg:grid-cols-[minmax(11rem,max-content)_1fr] lg:items-start">
                        <aside className="w-fit min-w-44 rounded-xl bg-card p-2 ring-1 ring-white/5">
                            <p className="mb-3 px-2 text-sm font-semibold text-eventcontent/65">Categories</p>
                            <div className="flex flex-col gap-1">
                                {categories.map((category) => {
                                    const active = selectedCategory === category;
                                    const count = category === "all" ? events.length : (categoryCounts[category] ?? 0);
                                    return (
                                        <button
                                            key={category}
                                            type="button"
                                            onClick={() => setSelectedCategory(category)}
                                            className={`flex items-center justify-between rounded-md px-2 py-1.5 text-left text-sm transition ${
                                                active
                                                    ? "bg-white/10 text-white"
                                                    : "text-eventcontent/75 hover:bg-white/5 hover:text-white"
                                            }`}
                                        >
                                            <span className="capitalize">{category}</span>
                                            <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-medium tabular-nums ${
                                                active ? "bg-white/20 text-white" : "bg-white/10 text-eventcontent/60"
                                            }`}>
                                                {count}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </aside>

                        <section>
                            <div className="relative mb-4">
                                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-eventcontent/55" />
                                <Input
                                    ref={searchInputRef}
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search events…"
                                    className="h-11 border-white/5 bg-card pl-9 text-white placeholder:text-eventcontent/45"
                                />
                                <kbd className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 hidden sm:flex items-center gap-1 rounded border border-white/10 px-1.5 py-0.5 text-[10px] text-eventcontent/40">
                                    /
                                </kbd>
                            </div>

                            <div className="flex flex-col gap-3">
                                {isEventsLoading ? (
                                    <>
                                        <Skeleton className="h-14 rounded-xl" />
                                        <Skeleton className="h-14 rounded-xl" />
                                        <Skeleton className="h-14 rounded-xl" />
                                        <Skeleton className="h-14 rounded-xl" />
                                        <Skeleton className="h-14 rounded-xl" />
                                    </>
                                ) : pagedEvents.length > 0 ? (
                                    pagedEvents.map((event, index) => (
                                        <Event key={`${event.title}-${index}`} {...event} />
                                    ))
                                ) : events.length === 0 ? (
                                    <QuickStartEmptyState projectId={id} />
                                ) : (
                                    <div className="rounded-xl bg-card p-5 text-sm text-eventcontent/75 ring-1 ring-white/5">
                                        No events match your search.
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
                                            variant="secondary"
                                            size="sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        >
                                            Previous
                                        </Button>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

function QuickStartEmptyState({ projectId }: { projectId: string }) {
    const [copied, setCopied] = useState(false);

    const snippet = `import { createUpstream } from "@linuskang/upstream-sdk";

const upstream = createUpstream({ apiKey: "up_..." });

await upstream.track({
  title: "User signed up",
  icon: "🎉",
  category: "auth",
  content: "A new user created an account.",
  fields: [
    { name: "Plan", value: "Hobby" },
    { name: "Source", value: "organic" },
  ],
});`;

    async function copy() {
        await navigator.clipboard.writeText(snippet);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    return (
        <div className="rounded-xl bg-card p-5 ring-1 ring-white/5 space-y-4">
            <div>
                <p className="text-base font-semibold text-white">No events yet</p>
                <p className="mt-0.5 text-sm text-eventcontent/65">
                    Send your first event using the SDK or the API directly.
                </p>
            </div>

            <div className="relative rounded-lg bg-eventbg">
                <pre className="overflow-x-auto p-3 text-xs text-eventcontent/80 leading-relaxed">
                    {snippet}
                </pre>
                <button
                    onClick={copy}
                    className="absolute top-2 right-2 flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-xs text-eventcontent/70 hover:bg-white/15 transition cursor-pointer"
                >
                    {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                    {copied ? "Copied" : "Copy"}
                </button>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <Link href={`/settings/projects/${projectId}`}>
                    <Button size="sm" variant="secondary" className="cursor-pointer">
                        Get API Key
                    </Button>
                </Link>
            </div>
        </div>
    );
}
