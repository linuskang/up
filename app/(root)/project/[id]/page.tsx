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
import { Folder } from "lucide-react"

export default function Page() {
    const params = useParams();

    const [project, setProject] = useState<{ project: { name: string } } | null>(null);
    const [events, setEvents] = useState<EventProps[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("all");

    useEffect(() => {
        const fetchProject = async () => {
            const res = await fetch(`/api/project/${params.id}`);
            if (!res.ok) {
                return notFound()
            } else {
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
            }
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

    const filteredEvents = selectedCategory === "all"
        ? events
        : events.filter((e) => (e.category || "none") === selectedCategory);

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
                        <div className="min-w-0">
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