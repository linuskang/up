"use client"

// Libraries
import axios from "axios"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/client/auth"
import Link from "next/link"
import Image from "next/image"

// Components
import { Folder, ArrowUpRight } from "lucide-react"
import { Button } from "@uplabs/ui/components/button"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@uplabs/ui/components/table"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@uplabs/ui/components/pagination"
import { Card } from "@uplabs/ui/components/card"

// Types
interface Project {
    id: string
    name: string
}

interface Usage {
    plan: string
    projects: {
        current: number
        limit: number
    }
    eventsMonth: {
        current: number
        limit: number
    }
}

export default function Page() {
    const router = useRouter()
    const { data: session, isPending } = authClient.useSession()

    const [currentPage, setCurrentPage] = useState(1)

    const [usageLoading, setUsageLoading] = useState(true)
    const [projectsLoading, setProjectsLoading] = useState(true)
    const [projects, setProjects] = useState<Project[]>([])
    const [usage, setUsage] = useState<Usage>({
        plan: "Free",
        projects: {
            current: 0,
            limit: 1,
        },
        eventsMonth: {
            current: 0,
            limit: 100,
        },
    })

    useEffect(() => {
        if (!session) return

        async function fetchUrls() {
            setProjectsLoading(true)
            setUsageLoading(true)

            try {
                await axios.get('/api/project').then((res) => {
                    setProjects(res.data.projects)
                })

                await axios.get('/api/usage').then((res) => {
                    setUsage(res.data)
                })
            } catch (error) {
                console.error(error)
            } finally {
                setProjectsLoading(false)
                setUsageLoading(false)
            }
        }

        fetchUrls()
    }, [session])

    const totalPages = Math.ceil(projects.length / 5)
    const paginatedProjects = projects.slice(
        (currentPage - 1) * 5,
        currentPage * 5
    )

    if (isPending || projectsLoading || usageLoading) {
        return null
    }

    return (
        <div className="flex min-h-svh flex-col gap-3 py-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold">
                    Welcome, {session?.user.name}!
                </h1>
            </div>

            <div className="flex flex-col gap-3">
                <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-sm font-semibold text-muted-foreground">
                            Your Projects
                        </p>
                        <p className="text-xl font-bold text-foreground">
                            {usage.projects.current}{" "}
                            <span className="text-sm font-normal text-muted-foreground">
                                /{" "}
                                {usage.projects.limit}
                            </span>
                        </p>
                    </div>
                    <div className="rounded-lg bg-card p-3">
                        <p className="text-sm font-semibold text-muted-foreground">
                            Events Quota
                        </p>
                        <p className="text-xl font-bold text-foreground">
                            {(usage?.eventsMonth.current ?? 0).toLocaleString()}{" "}
                            <span className="text-sm font-normal text-muted-foreground">
                                /{" "}
                                {(
                                    usage?.eventsMonth.limit ?? 100
                                ).toLocaleString()}
                            </span>
                        </p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-3">
                        <p className="text-sm font-semibold text-muted-foreground">
                            Account Plan
                        </p>
                        <p className="text-xl font-bold text-foreground">
                            {usage?.plan}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">
                        Your Projects
                    </h2>
                    <Button variant="primary">
                        <Link href="/project/new">Create Project</Link>
                    </Button>
                </div>

                {projects.length === 0 ? (
                    <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg bg-muted/40 p-8 text-center">
                        <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                            <Folder
                                className="size-5 text-muted-foreground"
                                fill="currentColor"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <p className="text-sm font-semibold text-foreground">
                                No Projects Yet
                            </p>
                            <p className="max-w-sm text-xs text-muted-foreground">
                                You haven&apos;t created any projects yet. Get
                                started by creating your first project to start
                                tracking events.
                            </p>
                        </div>
                        <a
                            href="#"
                            className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                        >
                            Learn More
                            <ArrowUpRight className="size-3" />
                        </a>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="overflow-hidden rounded-xl bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/40 hover:bg-transparent">
                                        <TableHead className="w-fit pl-4 whitespace-nowrap text-muted-foreground">
                                            Project
                                        </TableHead>
                                        <TableHead className="w-fit pl-4 whitespace-nowrap text-muted-foreground">
                                            Owner
                                        </TableHead>
                                        <TableHead className="w-fit pr-4 pl-4 text-right whitespace-nowrap text-muted-foreground">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedProjects.map((project) => (
                                        <TableRow
                                            key={project.id}
                                            className="cursor-pointer border-border/40 transition-colors hover:bg-accent/50"
                                            onClick={() =>
                                                router.push(
                                                    `/project/${project.id}`
                                                )
                                            }
                                        >
                                            <TableCell className="w-fit pl-4 font-medium whitespace-nowrap text-foreground">
                                                {project.name}
                                            </TableCell>
                                            <TableCell className="w-fit pl-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <div className="relative size-6 overflow-hidden rounded-sm border border-border/60 bg-secondary">
                                                        <Image
                                                            src={
                                                                session?.user
                                                                    .image || ""
                                                            }
                                                            alt={
                                                                session?.user
                                                                    .name ||
                                                                "Avatar"
                                                            }
                                                            width={24}
                                                            height={24}
                                                            unoptimized
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                    <span className="text-sm text-muted-foreground">
                                                        {session?.user.name}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="w-fit pr-4 pl-4 text-right whitespace-nowrap">
                                                <Button
                                                    variant="secondary"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        router.push(
                                                            `/project/${project.id}/settings`
                                                        )
                                                    }}
                                                >
                                                    Manage
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationContent className="justify-center">
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() =>
                                                setCurrentPage((p) =>
                                                    Math.max(1, p - 1)
                                                )
                                            }
                                            className={
                                                currentPage === 1
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                        />
                                    </PaginationItem>
                                    {Array.from(
                                        { length: totalPages },
                                        (_, i) => i + 1
                                    ).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                isActive={page === currentPage}
                                                onClick={() =>
                                                    setCurrentPage(page)
                                                }
                                                className="cursor-pointer border-0"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() =>
                                                setCurrentPage((p) =>
                                                    Math.min(totalPages, p + 1)
                                                )
                                            }
                                            className={
                                                currentPage === totalPages
                                                    ? "pointer-events-none opacity-50"
                                                    : "cursor-pointer"
                                            }
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
