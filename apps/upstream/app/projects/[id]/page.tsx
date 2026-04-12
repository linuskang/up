"use client";

import { useEffect, useMemo, use, useState } from "react";
import { authClient } from "@/client/auth";
import { redirect } from "next/navigation";
import { Search } from "lucide-react";
import Navbar from "@/components/navbar";
import Event from "@/components/event";
import { Input } from "@workspace/ui/components/input";
import { Button } from "@workspace/ui/components/button";
import type { EventProps } from "@/types";

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

function toEventProps(event: EventFromApi): EventProps {
    return {
        title: event.title,
        icon: event.icon,
        time: new Date(event.createdAt).toLocaleString(),
        content: event.content || undefined,
        category: event.category || undefined,
        fields: Array.isArray(event.fields) ? event.fields : undefined,
        events: Array.isArray(event.events) ? event.events : undefined,
        actions: Array.isArray(event.actions) ? event.actions : undefined,
        data: event.data ?? undefined,
    };
}

const EVENTS_PER_PAGE = 15;

export default function Page({ params }: PageProps) {
    const { id } = use(params);
    const { data: session, isPending } = authClient.useSession();
    const [events, setEvents] = useState<EventProps[]>([]);
    const [isEventsLoading, setIsEventsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        let cancelled = false;

        async function loadEvents() {
            setIsEventsLoading(true);

            try {
                const response = await fetch(`/api/v1/events?projectId=${id}&limit=100`, {
                    method: "GET",
                });

                if (!response.ok) {
                    if (!cancelled) {
                        setEvents([]);
                    }
                    return;
                }

                const data = (await response.json()) as { events?: EventFromApi[] };

                if (!cancelled) {
                    setEvents((data.events || []).map(toEventProps));
                }
            } finally {
                if (!cancelled) {
                    setIsEventsLoading(false);
                }
            }
        }

        loadEvents();

        return () => {
            cancelled = true;
        };
    }, [id]);

    const categories = useMemo(() => {
        const derived = Array.from(
            new Set(
                events
                    .map((event) => event.category)
                    .filter((category): category is string => Boolean(category))
            )
        );

        return ["all", ...derived];
    }, [events]);

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
                user={{
                    name: session.user.name,
                    email: session.user.email,
                    image: session.user.image || "",
                }}
            />

            <main className="flex-1 px-4 pb-6 sm:px-6">
                <div className="mx-auto w-full max-w-2xl">

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
                                {isEventsLoading ? (
                                    <div className="rounded-xl bg-card p-5 text-sm text-eventcontent/75 ring-1 ring-white/5">
                                        Loading events...
                                    </div>
                                ) : pagedEvents.length > 0 ? (
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
