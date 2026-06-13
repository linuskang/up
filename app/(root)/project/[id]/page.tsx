'use client';

import { notFound } from "next/navigation";
// Libraries
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link"

import type { EventProps } from "@/components/event";
import { EventsList } from "@/components/event"
import { CategorySelector } from "@/components/category-selector"
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Folder, Search } from "lucide-react"

export default function Page() {
    const params = useParams();

    const [project, setProject] = useState<{ project: { name: string } } | null>(null);
    const [events, setEvents] = useState<EventProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchProject = async () => {
            const res = await fetch(`/api/project/${params.id}`);
            if (!res.ok) {
                setNotFoundState(true);
                setLoading(false);
                return;
            }

            const projectData = await res.json();
            setProject(projectData);

            const eventsRes = await fetch(`/api/project/${params.id}/events`);
            if (!eventsRes.ok) {
                setEvents([]);
            } else {
                const eventsData = await eventsRes.json();
                const sortedEvents = eventsData.sort((a: EventProps, b: EventProps) => {
                    const dateA = new Date(a.createdAt).getTime();
                    const dateB = new Date(b.createdAt).getTime();
                    return dateB - dateA;
                });
                setEvents(sortedEvents);
            }
            setLoading(false);
        };
        fetchProject();
    }, [params.id]);

    if (loading) {
        return (
            <div className="flex min-h-svh items-center justify-center py-6">
                <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
        )
    }

    if (notFoundState) {
        return notFound();
    }

    const categories = [
        { name: "all", count: events.length },
        ...Array.from(
            events.reduce((acc, event) => {
                const cat = event.category || "none";
                acc.set(cat, (acc.get(cat) || 0) + 1);
                return acc;
            }, new Map<string, number>())
        ).map(([name, count]) => ({ name, count })),
    ];

    const filteredEvents = events.filter((e) => {
        const matchesCategory = selectedCategory === "all" || (e.category || "none") === selectedCategory;
        if (!searchQuery) return matchesCategory;
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            e.title.toLowerCase().includes(query) ||
            (e.category?.toLowerCase() || "").includes(query) ||
            (typeof e.content === "string" && e.content.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });

    return (
        <main>
            <div className="flex min-h-svh flex-col items-center gap-6 py-6">
                <div className="flex w-fit flex-col gap-3">
                    <Breadcrumb>
                        <BreadcrumbList className="text-sm">
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Projects</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{project?.project?.name ?? "Project"}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-semibold">Events</h1>

                        <Button className="w-fit" variant="default" size="sm">
                            <Link href={`/project/${params.id}/settings`}>Project Settings</Link>
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        <div className="sticky top-6 h-fit">
                            <CategorySelector
                                categories={categories}
                                selectedCategory={selectedCategory}
                                onSelectCategory={setSelectedCategory}
                            />
                        </div>
                        <div className="flex min-w-0 flex-col gap-3">
                            <div className="relative w-full">
                                <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
                                <Input
                                    placeholder="Search events..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="bg-card text-sm font-semibold pl-9 h-10 border-0"
                                />
                            </div>
                            {filteredEvents.length === 0 ? (
                                <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg bg-muted/40 p-8 text-center">
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                                        <Folder
                                            className="size-5 text-muted-foreground"
                                            fill="currentColor"
                                        />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <p className="text-sm font-semibold text-foreground">
                                            No Events Yet
                                        </p>
                                        <p className="max-w-sm text-xs text-muted-foreground">
                                            No events have been logged for this project yet.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <EventsList events={filteredEvents} />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}