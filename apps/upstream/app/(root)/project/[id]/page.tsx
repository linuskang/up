'use client';

import { notFound } from "next/navigation";
// Libraries
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import Link from "next/link"

import type { EventProps } from "@/components/event";
import { EventsList } from "@/components/event"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Folder, Search, Loader2 } from "lucide-react"

const EVENTS_PER_PAGE = 20

interface EventItem extends EventProps {
    id: string
}

export default function Page() {
    const params = useParams();

    const [project, setProject] = useState<{ project: { name: string } } | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [searchQuery, setSearchQuery] = useState("");

    // "all" events cache
    const [allEvents, setAllEvents] = useState<EventItem[]>([]);
    const [allPage, setAllPage] = useState(1);
    const [allHasMore, setAllHasMore] = useState(true);

    // category-specific events
    const [catEvents, setCatEvents] = useState<EventItem[]>([]);
    const [catPage, setCatPage] = useState(1);
    const [catHasMore, setCatHasMore] = useState(true);

    const [loadingMore, setLoadingMore] = useState(false);
    const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Initial load: project, first page of all events, and categories
    useEffect(() => {
        const fetchProject = async () => {
            const [projectRes, eventsRes, categoriesRes] = await Promise.all([
                fetch(`/api/project/${params.id}`),
                fetch(`/api/project/${params.id}/events?page=1&limit=${EVENTS_PER_PAGE}`),
                fetch(`/api/project/${params.id}/categories`),
            ]);

            if (!projectRes.ok) {
                setNotFoundState(true);
                setLoading(false);
                return;
            }

            const projectData = await projectRes.json();
            setProject(projectData);

            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                setAllEvents(eventsData);
                if (eventsData.length < EVENTS_PER_PAGE) {
                    setAllHasMore(false);
                }
            }

            if (categoriesRes.ok) {
                const categoriesData = await categoriesRes.json();
                setCategories([
                    { name: "all", count: categoriesData.total },
                    ...categoriesData.categories,
                ]);
            }

            setLoading(false);
        };
        fetchProject();
    }, [params.id]);



    const handleCategoryChange = async (category: string) => {
        setSelectedCategory(category);
        const isAll = category === "all";

        if (isAll) {
            setAllEvents([]);
            setAllPage(1);
            setAllHasMore(true);
        } else {
            setCatEvents([]);
            setCatPage(1);
            setCatHasMore(true);
        }
        setLoadingMore(true);

        const res = await fetch(
            `/api/project/${params.id}/events?page=1&limit=${EVENTS_PER_PAGE}${
                !isAll ? `&category=${category}` : ""
            }`
        );
        if (res.ok) {
            const data = await res.json();
            if (isAll) {
                setAllEvents(data);
                if (data.length < EVENTS_PER_PAGE) {
                    setAllHasMore(false);
                }
            } else {
                setCatEvents(data);
                if (data.length < EVENTS_PER_PAGE) {
                    setCatHasMore(false);
                }
            }
        }
        setLoadingMore(false);
    };

    // Infinite scroll observer
    useEffect(() => {
        if (!sentinelRef.current || loading) return;
        const isAll = selectedCategory === "all";
        if (isAll && !allHasMore) return;
        if (!isAll && !catHasMore) return;

        const loadMore = async () => {
            if (loadingMore) return;
            if (isAll && !allHasMore) return;
            if (!isAll && !catHasMore) return;

            setLoadingMore(true);
            const nextPage = isAll ? allPage + 1 : catPage + 1;
            const url = `/api/project/${params.id}/events?page=${nextPage}&limit=${EVENTS_PER_PAGE}${
                !isAll ? `&category=${selectedCategory}` : ""
            }`;
            const res = await fetch(url);
            if (res.ok) {
                const data = await res.json();
                if (isAll) {
                    setAllEvents((prev) => [...prev, ...data]);
                    setAllPage(nextPage);
                    if (data.length < EVENTS_PER_PAGE) setAllHasMore(false);
                } else {
                    setCatEvents((prev) => [...prev, ...data]);
                    setCatPage(nextPage);
                    if (data.length < EVENTS_PER_PAGE) setCatHasMore(false);
                }
            }
            setLoadingMore(false);
        };

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    loadMore();
                }
            },
            { rootMargin: "200px" }
        );

        observer.observe(sentinelRef.current);
        return () => observer.disconnect();
    }, [selectedCategory, allHasMore, catHasMore, loading, loadingMore, allPage, catPage, params.id]);

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

    const displayedEvents = selectedCategory === "all" ? allEvents : catEvents;

    const filteredEvents = displayedEvents.filter((e) => {
        const matchesCategory = selectedCategory === "all" || (e.category || "none") === selectedCategory;
        if (!searchQuery) return matchesCategory;
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            e.title.toLowerCase().includes(query) ||
            (e.category?.toLowerCase() || "").includes(query) ||
            (typeof e.content === "string" && e.content.toLowerCase().includes(query));
        return matchesCategory && matchesSearch;
    });

    const hasMoreToLoad = selectedCategory === "all" ? allHasMore : catHasMore;

    return (
        <main>
            <div className="flex min-h-svh flex-col gap-3 py-6">
                <div className="flex flex-col gap-3">
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

                    <div className="flex items-center justify-between gap-3">
                        <h1 className="text-3xl font-semibold">Events</h1>

                        <div className="flex items-center gap-2">
                            <Button className="w-fit shrink-0" variant="default" size="sm">
                                <Link href={`/project/${params.id}/settings`}>Project Settings</Link>
                            </Button>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <div className="relative">
                            <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground z-10" />
                            <Input
                                placeholder="Search events..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-card !text-md font-base pl-9 pr-[8.5rem] h-10 border-0"
                            />
                            <div className="absolute top-1/2 right-0 -translate-y-1/2">
                                <Select
                                    value={selectedCategory}
                                    onValueChange={handleCategoryChange}
                                >
                                    <SelectTrigger className="h-10 w-32 shrink-0 border-0 bg-transparent shadow-none focus:ring-0 focus:ring-offset-0">
                                        <SelectValue placeholder="Category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((cat) => (
                                            <SelectItem key={cat.name} value={cat.name}>
                                                <span className="capitalize">{cat.name}</span>
                                                <span className="ml-1 text-muted-foreground">({cat.count})</span>
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {filteredEvents.length === 0 && !loadingMore ? (
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

                        {filteredEvents.length > 0 && hasMoreToLoad && (
                            <div ref={sentinelRef} className="flex items-center justify-center py-4">
                                {loadingMore && (
                                    <Loader2 className="size-5 animate-spin text-muted-foreground" />
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    )
}
