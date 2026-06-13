"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import { EllipsisVertical, Trash2, Globe, MailX } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";

export default function Page() {
    return (
        <div className="flex min-h-screen flex-col bg-background text-white">
            <main className="flex-1">
                <div className="w-full py-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList className="text-sm">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">Dashboard</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">My Project</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Settings</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-bold">My Project</h1>
                        </div>
                        <Dialog>
                            <DialogTrigger asChild>
                                <Button variant="secondary" className="cursor-pointer">
                                    Rename Project
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Rename Project</DialogTitle>
                                    <DialogDescription>
                                        Update the project name shown across the dashboard and settings pages.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-3">
                                    <Input placeholder="Project name" />
                                </div>
                                <DialogFooter>
                                    <Button className="cursor-pointer">Save Changes</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mb-8 mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold">API Tokens</h2>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button className="cursor-pointer">Create API Key</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Create API Key</DialogTitle>
                                        <DialogDescription>
                                            Create a key to send events to this project.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <Input placeholder="Name*" />
                                        <Textarea placeholder="Description (optional)" />
                                    </div>
                                    <DialogFooter>
                                        <Button className="cursor-pointer">Create API Key</Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Dialog>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Your API Key</DialogTitle>
                                    <DialogDescription>
                                        This is the only time we can show the secret for this API key.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="rounded-md bg-black/30 p-3 font-mono text-xs break-all">
                                    up_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
                                </div>
                                <DialogFooter>
                                    <Button className="cursor-pointer">Copy</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <div className="rounded-lg bg-card ring-1 ring-white/5">
                            <div className="p-4 text-center">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyTitle>No API Keys Yet</EmptyTitle>
                                        <EmptyDescription>
                                            Create your first key to start tracking events from your project.
                                        </EmptyDescription>
                                    </EmptyHeader>
                                </Empty>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 rounded-lg bg-card p-4 ring-1 ring-white/5">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h2 className="text-sm font-semibold text-red-300">Danger Zone</h2>
                                <p className="mt-1 text-xs text-eventcontent/65">
                                    Deleting this project removes members, API keys, and events permanently.
                                </p>
                            </div>
                            <Button variant="destructive" className="cursor-pointer">
                                <Trash2 className="mr-1 size-4" />
                                Delete Project
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
