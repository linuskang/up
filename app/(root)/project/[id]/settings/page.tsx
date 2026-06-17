"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@/components/ui/empty"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2, Copy, Check } from "lucide-react";
import Link from "next/link";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator
} from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import { notFound, useRouter } from "next/navigation";
import { authClient } from "@/client/auth"
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface ApiKey {
    id: string
    name: string
    createdAt: string
    lastUsed: string | null
    active: boolean
    addedBy: {
        id: string
        name: string
        email: string
        image?: string
    }
}

export default function Page() {
    const params = useParams();
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();

    const [project, setProject] = useState<{ name: string; id: string } | null>(null);
    const [keys, setKeys] = useState<ApiKey[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFoundState, setNotFoundState] = useState(false);
    const [newProjectName, setNewProjectName] = useState("");
    const [newKeyName, setNewKeyName] = useState("");
    const [createdKey, setCreatedKey] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [renameOpen, setRenameOpen] = useState(false);
    const [createKeyOpen, setCreateKeyOpen] = useState(false);
    const [showKeyOpen, setShowKeyOpen] = useState(false);
    const [deleteOpen, setDeleteOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreatingKey, setIsCreatingKey] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            const [projectRes, keysRes] = await Promise.all([
                fetch(`/api/project/${params.id}`),
                fetch(`/api/project/${params.id}/keys`),
            ]);

            if (!projectRes.ok) {
                setNotFoundState(true);
                setLoading(false);
                return;
            }

            const projectData = await projectRes.json();
            setProject(projectData.project);
            setNewProjectName(projectData.project.name);

            if (keysRes.ok) {
                const keysData = await keysRes.json();
                setKeys(keysData.keys || []);
            }

            setLoading(false);
        };
        fetchData();
    }, [params.id]);

    const rename = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const res = await fetch(`/api/project/${params.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newProjectName }),
        });

        if (res.ok) {
            setProject((prev) => prev ? { ...prev, name: newProjectName } : prev);
            toast.success("Project renamed successfully.");
            setRenameOpen(false);
        } else {
            toast.error("Failed to rename project.");
        }

        setIsSaving(false);
    };

    const createKey = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingKey(true);

        const res = await fetch(`/api/project/${params.id}/keys`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: newKeyName }),
        });

        if (res.ok) {
            const data = await res.json();
            setCreatedKey(data.key);
            setNewKeyName("");
            setCreateKeyOpen(false);
            setShowKeyOpen(true);

            // Refresh keys list
            const keysRes = await fetch(`/api/project/${params.id}/keys`);
            if (keysRes.ok) {
                const keysData = await keysRes.json();
                setKeys(keysData.keys || []);
            }
        } else {
            toast.error("Failed to create API key.");
        }

        setIsCreatingKey(false);
    };

    const deleteKey = async (keyId: string) => {
        const res = await fetch(`/api/project/${params.id}/keys`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ keyId }),
        });

        if (res.ok) {
            setKeys((prev) => prev.filter((k) => k.id !== keyId));
            toast.success("API key deleted.");
        } else {
            toast.error("Failed to delete API key.");
        }
    };

    const deleteProject = async () => {
        setIsDeleting(true);

        const res = await fetch(`/api/project/${params.id}`, {
            method: "DELETE",
        });

        if (res.ok) {
            toast.success("Project deleted.");
            router.push("/");
        } else {
            toast.error("Failed to delete project.");
            setIsDeleting(false);
        }
    };

    const copyKey = () => {
        if (createdKey) {
            navigator.clipboard.writeText(createdKey);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    if (isPending || loading) {
        return (
            <div className="flex min-h-svh flex-col gap-8 py-6">
                <div className="flex flex-col gap-1">
                    <Breadcrumb>
                        <BreadcrumbList className="text-sm">
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/">Projects</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Settings</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
            </div>
        );
    }

    if (notFoundState) {
        return notFound();
    }

    if (!session) {
        return null;
    }

    return (
        <div className="flex min-h-svh flex-col gap-3 py-6">
            <div className="flex flex-col gap-1">
                <Breadcrumb>
                    <BreadcrumbList className="text-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/">Projects</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href={`/project/${params.id}`}>{project?.name}</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Settings</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                <div className="min-w-0">
                    <h1 className="truncate text-2xl font-bold">{project?.name}</h1>
                </div>
                <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
                    <DialogTrigger asChild>
                        <Button variant="secondary" className="cursor-pointer">
                            Rename Project
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card ring-0">
                        <DialogHeader>
                            <DialogTitle>Rename Project</DialogTitle>
                            <DialogDescription>
                                Update the project name shown across the dashboard and settings pages.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={rename} className="space-y-3">
                            <div>
                                <Label htmlFor="project-name">Project Name</Label>
                                <Input
                                    id="project-name"
                                    value={newProjectName}
                                    onChange={(e) => setNewProjectName(e.target.value)}
                                    className="bg-input border-0"
                                />
                            </div>
                            <DialogFooter>
                                <Button type="submit" className="cursor-pointer" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save Changes"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">API Keys</h2>
                    <Dialog open={createKeyOpen} onOpenChange={setCreateKeyOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer" size="sm">Create API Key</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card ring-0 sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create API Key</DialogTitle>
                                <DialogDescription>
                                    Create a key to send events to this project.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={createKey} className="space-y-3">
                                <div>
                                    <Label htmlFor="key-name">Name *</Label>
                                    <Input
                                        id="key-name"
                                        placeholder="Production"
                                        value={newKeyName}
                                        onChange={(e) => setNewKeyName(e.target.value)}
                                        className="bg-input border-0"
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="cursor-pointer" disabled={isCreatingKey}>
                                        {isCreatingKey ? "Creating..." : "Create API Key"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <Dialog open={showKeyOpen} onOpenChange={setShowKeyOpen}>
                    <DialogContent className="bg-card ring-0 sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Your API Key</DialogTitle>
                            <DialogDescription>
                                This is the only time we can show the secret for this API key.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="flex items-center gap-2 rounded-md bg-black/30 p-3 font-mono text-xs break-all">
                            <span className="flex-1">{createdKey}</span>
                            <Button variant="ghost" size="icon" className="size-6 shrink-0" onClick={copyKey}>
                                {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
                            </Button>
                        </div>
                        <DialogFooter>
                            <Button className="cursor-pointer" onClick={() => setShowKeyOpen(false)}>
                                Done
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {keys.length === 0 ? (
                    <div className="rounded-xl bg-card ring-0">
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
                ) : (
                    <div className="overflow-hidden rounded-xl bg-card">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border/40 hover:bg-transparent">
                                    <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Name</TableHead>
                                    <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Created</TableHead>
                                    <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Last used</TableHead>
                                    <TableHead className="w-fit whitespace-nowrap pl-4 pr-4 text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {keys.map((key) => (
                                    <TableRow
                                        key={key.id}
                                        className="border-border/40 transition-colors hover:bg-accent/50"
                                    >
                                        <TableCell className="w-fit whitespace-nowrap pl-4 font-medium text-foreground">
                                            {key.name}
                                        </TableCell>
                                        <TableCell className="w-fit whitespace-nowrap pl-4 text-muted-foreground">
                                            {new Date(key.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell className="w-fit whitespace-nowrap pl-4 text-muted-foreground">
                                            {key.lastUsed ? new Date(key.lastUsed).toLocaleDateString() : "Never"}
                                        </TableCell>
                                        <TableCell className="w-fit whitespace-nowrap pl-4 pr-4 text-right">
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button
                                                        variant="destructive"
                                                        size="sm"
                                                        className="h-7 text-xs"
                                                    >
                                                        Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className="bg-card ring-0">
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete API Key?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This will permanently delete the &quot;{key.name}&quot; API key. Any integrations using this key will stop working.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel className="border-0">Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                            onClick={() => deleteKey(key.id)}
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>

                <div className="mt-4 rounded-lg bg-card p-4 ring-0">
                <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h2 className="text-sm font-semibold text-destructive">Danger Zone</h2>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Deleting this project removes API keys and events permanently.
                        </p>
                    </div>
                    <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="cursor-pointer">
                                <Trash2 className="mr-1 size-4" />
                                Delete Project
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent className="bg-card ring-0">
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Project?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete &quot;{project?.name}&quot; and all its API keys and events. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel className="border-0">Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    onClick={deleteProject}
                                    disabled={isDeleting}
                                >
                                    {isDeleting ? "Deleting..." : "Delete Project"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </div>
        </div>
    );
}
