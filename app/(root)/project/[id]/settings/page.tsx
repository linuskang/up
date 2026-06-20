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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { ApiKey } from "@/types";
import { RequestLog } from "@/types";
import { Webhook } from "@/types"
import { Switch } from "@/components/ui/switch"


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
    const [auditLogs, setAuditLogs] = useState<{ message: string; createdAt: string; user: { name: string; image: string | null } | null }[]>([]);
    const [auditLogPage, setAuditLogPage] = useState(1);
    const AUDIT_LOGS_PER_PAGE = 5;
    const [requestLogPage, setRequestLogPage] = useState(1);
    const [requestLogs, setRequestLogs] = useState<RequestLog[]>([]);
    const [selectedRequestLog, setSelectedRequestLog] = useState<RequestLog | null>(null);
    const [requestLogDetailOpen, setRequestLogDetailOpen] = useState(false);
    const REQUEST_LOGS_PER_PAGE = 5;
    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [webhookPage, setWebhookPage] = useState(1);
    const WEBHOOKS_PER_PAGE = 5;
    const [createWebhookOpen, setCreateWebhookOpen] = useState(false);
    const [newWebhookName, setNewWebhookName] = useState("");
    const [newWebhookSubscription, setNewWebhookSubscription] = useState("");
    const [newWebhookUrl, setNewWebhookUrl] = useState("");
    const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
    const [editingWebhook, setEditingWebhook] = useState<Webhook | null>(null);
    const [editWebhookOpen, setEditWebhookOpen] = useState(false);
    const [editWebhookName, setEditWebhookName] = useState("");
    const [editWebhookSubscription, setEditWebhookSubscription] = useState("");
    const [editWebhookUrl, setEditWebhookUrl] = useState("");
    const [editWebhookEnabled, setEditWebhookEnabled] = useState(true);
    const [isEditingWebhook, setIsEditingWebhook] = useState(false);

    function getPageNumbers(current: number, total: number): (number | "...")[] {
        if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
        const pages: (number | "...")[] = [1];
        if (current > 3) pages.push("...");
        const start = Math.max(2, current - 1);
        const end = Math.min(total - 1, current + 1);
        for (let i = start; i <= end; i++) pages.push(i);
        if (current < total - 2) pages.push("...");
        pages.push(total);
        return pages;
    }

    useEffect(() => {
        const fetchData = async () => {
            const [projectRes, keysRes, auditLogsRes, requestLogsRes, webhooksRes] = await Promise.all([
                fetch(`/api/project/${params.id}`),
                fetch(`/api/project/${params.id}/keys`),
                fetch(`/api/project/${params.id}/auditlogs`),
                fetch(`/api/project/${params.id}/requestlogs`),
                fetch(`/api/project/${params.id}/webhooks`),
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

            if (auditLogsRes.ok) {
                const auditLogsData = await auditLogsRes.json();
                setAuditLogs(auditLogsData.auditLogs || []);
            }

            if (requestLogsRes.ok) {
                const requestLogsData = await requestLogsRes.json();
                setRequestLogs(requestLogsData.requestLogs || []);
            }

            if (webhooksRes.ok) {
                const webhooksData = await webhooksRes.json();
                setWebhooks(webhooksData.webhooks || []);
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

    const createWebhook = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsCreatingWebhook(true);

        const res = await fetch(`/api/project/${params.id}/webhooks`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: newWebhookName,
                subscription: newWebhookSubscription,
                url: newWebhookUrl,
            }),
        });

        if (res.ok) {
            const data = await res.json();
            setWebhooks((prev) => [...prev, data.webhook]);
            setNewWebhookName("");
            setNewWebhookSubscription("");
            setNewWebhookUrl("");
            setCreateWebhookOpen(false);
            toast.success("Webhook created.");
        } else {
            toast.error("Failed to create webhook.");
        }

        setIsCreatingWebhook(false);
    };

    const deleteWebhook = async (webhookId: string) => {
        const res = await fetch(`/api/project/${params.id}/webhooks`, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ webhookId }),
        });

        if (res.ok) {
            setWebhooks((prev) => prev.filter((w) => w.id !== webhookId));
            toast.success("Webhook deleted.");
        } else {
            toast.error("Failed to delete webhook.");
        }
    };

    const updateWebhook = async (webhookId: string, data: { name?: string; url?: string; subscription?: string; enabled?: boolean }) => {
        const res = await fetch(`/api/project/${params.id}/webhooks`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ webhookId, ...data }),
        });

        if (res.ok) {
            const resData = await res.json();
            setWebhooks((prev) =>
                prev.map((w) => (w.id === webhookId ? resData.webhook : w))
            );
            toast.success("Webhook updated.");
        } else {
            toast.error("Failed to update webhook.");
        }
    };

    const openEditWebhook = (webhook: Webhook) => {
        setEditingWebhook(webhook);
        setEditWebhookName(webhook.name);
        setEditWebhookSubscription(webhook.subscription);
        setEditWebhookUrl(webhook.url);
        setEditWebhookEnabled(webhook.enabled);
        setEditWebhookOpen(true);
    };

    const saveEditWebhook = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingWebhook) return;
        setIsEditingWebhook(true);
        await updateWebhook(editingWebhook.id, {
            name: editWebhookName,
            url: editWebhookUrl,
            subscription: editWebhookSubscription,
            enabled: editWebhookEnabled,
        });
        setIsEditingWebhook(false);
        setEditWebhookOpen(false);
        setEditingWebhook(null);
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

    const formatJson = (body: string | null) => {
        if (!body) return null;
        try {
            return JSON.stringify(JSON.parse(body), null, 2);
        } catch {
            return body;
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

            <div className="min-w-0">
                <h1 className="truncate text-2xl font-bold">{project?.name}</h1>
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

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Recent Activity</h2>
                </div>

                {auditLogs.length === 0 ? (
                    <div className="rounded-xl bg-card ring-0">
                        <div className="p-4 text-center">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>No Audit Logs Yet</EmptyTitle>
                                    <EmptyDescription>
                                        Activity on this project will appear here.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="overflow-hidden rounded-xl bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/40 hover:bg-transparent">
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">User</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Message</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 pr-4 text-right text-muted-foreground">Timestamp</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditLogs
                                        .slice((auditLogPage - 1) * AUDIT_LOGS_PER_PAGE, auditLogPage * AUDIT_LOGS_PER_PAGE)
                                        .map((log, index) => (
                                            <TableRow
                                                key={index}
                                                className="border-border/40 transition-colors hover:bg-accent/50"
                                            >
                                                <TableCell className="w-fit whitespace-nowrap pl-4">
                                                    {log.user ? (
                                                        <div className="flex items-center gap-2">
                                                            <Avatar size="sm">
                                                                <AvatarImage src={log.user.image ?? undefined} alt={log.user.name} />
                                                            </Avatar>
                                                            <span className="text-sm text-foreground">{log.user.name}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-sm text-muted-foreground">System</span>
                                                    )}
                                                </TableCell>

                                                <TableCell className="w-fit whitespace-nowrap pl-4 font-medium text-foreground">
                                                    {log.message}
                                                </TableCell>

                                                <TableCell className="w-fit whitespace-nowrap pl-4 pr-4 text-right text-muted-foreground">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>

                        {auditLogs.length > AUDIT_LOGS_PER_PAGE && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setAuditLogPage((p) => Math.max(1, p - 1));
                                            }}
                                            aria-disabled={auditLogPage === 1}
                                            className={auditLogPage === 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                    {getPageNumbers(auditLogPage, Math.ceil(auditLogs.length / AUDIT_LOGS_PER_PAGE)).map((page, idx) =>
                                        page === "..." ? (
                                            <PaginationItem key={`audit-ellipsis-${idx}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        ) : (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={page === auditLogPage}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setAuditLogPage(page);
                                                    }}
                                                    className="border-0"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setAuditLogPage((p) => Math.min(Math.ceil(auditLogs.length / AUDIT_LOGS_PER_PAGE), p + 1));
                                            }}
                                            aria-disabled={auditLogPage === Math.ceil(auditLogs.length / AUDIT_LOGS_PER_PAGE)}
                                            className={auditLogPage === Math.ceil(auditLogs.length / AUDIT_LOGS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Recent Requests</h2>
                </div>

                {requestLogs.length === 0 ? (
                    <div className="rounded-xl bg-card ring-0">
                        <div className="p-4 text-center">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>No requests yet</EmptyTitle>
                                    <EmptyDescription>
                                        Requests to this project will appear here.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="overflow-hidden rounded-xl bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/40 hover:bg-transparent">
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Method</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Endpoint</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Status</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Time</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 pr-4 text-right text-muted-foreground">Details</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {[...requestLogs]
                                        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                        .slice((requestLogPage - 1) * REQUEST_LOGS_PER_PAGE, requestLogPage * REQUEST_LOGS_PER_PAGE)
                                        .map((log) => (
                                            <TableRow
                                                key={log.id}
                                                className="border-border/40 transition-colors hover:bg-accent/50"
                                            >
                                                <TableCell className="w-fit whitespace-nowrap pl-4">
                                                    <Badge variant={log.method === "GET" ? "default" : log.method === "POST" ? "secondary" : log.method === "DELETE" ? "destructive" : "outline"}>
                                                        {log.method}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate whitespace-nowrap pl-4 font-medium text-foreground">
                                                    {log.endpoint}
                                                </TableCell>
                                                <TableCell className="w-fit whitespace-nowrap pl-4">
                                                    <span className={`text-sm font-medium ${log.status >= 200 && log.status < 300 ? "text-green-500" : log.status >= 400 ? "text-red-500" : "text-yellow-500"}`}>
                                                        {log.status}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="w-fit whitespace-nowrap pl-4 text-muted-foreground">
                                                    {new Date(log.createdAt).toLocaleString()}
                                                </TableCell>
                                                <TableCell className="w-fit whitespace-nowrap pl-4 pr-4 text-right">
                                                    <Button
                                                        variant="secondary"
                                                        size="sm"
                                                        onClick={() => {
                                                            setSelectedRequestLog(log);
                                                            setRequestLogDetailOpen(true);
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>

                        {requestLogs.length > REQUEST_LOGS_PER_PAGE && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setRequestLogPage((p) => Math.max(1, p - 1));
                                            }}
                                            aria-disabled={requestLogPage === 1}
                                            className={requestLogPage === 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                    {getPageNumbers(requestLogPage, Math.ceil(requestLogs.length / REQUEST_LOGS_PER_PAGE)).map((page, idx) =>
                                        page === "..." ? (
                                            <PaginationItem key={`request-ellipsis-${idx}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        ) : (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={page === requestLogPage}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setRequestLogPage(page);
                                                    }}
                                                    className="border-0"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setRequestLogPage((p) => Math.min(Math.ceil(requestLogs.length / REQUEST_LOGS_PER_PAGE), p + 1));
                                            }}
                                            aria-disabled={requestLogPage === Math.ceil(requestLogs.length / REQUEST_LOGS_PER_PAGE)}
                                            className={requestLogPage === Math.ceil(requestLogs.length / REQUEST_LOGS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </div>

            <Dialog open={requestLogDetailOpen} onOpenChange={setRequestLogDetailOpen}>
                <DialogContent className="w-full max-w-[calc(100vw-2rem)] bg-card ring-0 sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Request Details</DialogTitle>
                        <DialogDescription className="break-all">
                            {selectedRequestLog?.method} {selectedRequestLog?.endpoint}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className={`font-medium ${selectedRequestLog && selectedRequestLog.status >= 200 && selectedRequestLog.status < 300 ? "text-green-500" : selectedRequestLog && selectedRequestLog.status >= 400 ? "text-red-500" : "text-yellow-500"}`}>
                                {selectedRequestLog?.status}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">User Agent:</span>
                            <span className="font-medium text-foreground">{selectedRequestLog?.userAgent}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Time:</span>
                            <span className="font-medium text-foreground">
                                {selectedRequestLog ? new Date(selectedRequestLog.createdAt).toLocaleString() : ""}
                            </span>
                        </div>
                        {selectedRequestLog?.requestBody && (
                            <div className="space-y-1">
                                <Label className="text-sm text-muted-foreground">Request Body</Label>
                                <pre className="max-h-[200px] w-full overflow-auto rounded-md bg-black/30 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                                    {formatJson(selectedRequestLog.requestBody)}
                                </pre>
                            </div>
                        )}
                        {selectedRequestLog?.responseBody && (
                            <div className="space-y-1">
                                <Label className="text-sm text-muted-foreground">Response Body</Label>
                                <pre className="max-h-[200px] w-full overflow-auto rounded-md bg-black/30 p-3 font-mono text-xs whitespace-pre-wrap break-all">
                                    {formatJson(selectedRequestLog.responseBody)}
                                </pre>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button className="w-fit cursor-pointer" onClick={() => setRequestLogDetailOpen(false)}>
                            Close
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Webhooks</h2>
                    <Dialog open={createWebhookOpen} onOpenChange={setCreateWebhookOpen}>
                        <DialogTrigger asChild>
                            <Button className="cursor-pointer" size="sm">Create Webhook</Button>
                        </DialogTrigger>
                        <DialogContent className="bg-card ring-0 sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create Webhook</DialogTitle>
                                <DialogDescription>
                                    Send real-time events to your own endpoint.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={createWebhook} className="space-y-3">
                                <div>
                                    <Label htmlFor="webhook-name">Name *</Label>
                                    <Input
                                        id="webhook-name"
                                        placeholder="My Webhook"
                                        value={newWebhookName}
                                        onChange={(e) => setNewWebhookName(e.target.value)}
                                        className="bg-input border-0"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="webhook-subscription">Subscription *</Label>
                                    <Input
                                        id="webhook-subscription"
                                        placeholder="event.created"
                                        value={newWebhookSubscription}
                                        onChange={(e) => setNewWebhookSubscription(e.target.value)}
                                        className="bg-input border-0"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="webhook-url">URL *</Label>
                                    <Input
                                        id="webhook-url"
                                        placeholder="https://example.com/webhook"
                                        value={newWebhookUrl}
                                        onChange={(e) => setNewWebhookUrl(e.target.value)}
                                        className="bg-input border-0"
                                        type="url"
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="cursor-pointer" disabled={isCreatingWebhook}>
                                        {isCreatingWebhook ? "Creating..." : "Create Webhook"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>

                    <Dialog open={editWebhookOpen} onOpenChange={setEditWebhookOpen}>
                        <DialogContent className="bg-card ring-0 sm:max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Edit Webhook</DialogTitle>
                                <DialogDescription>
                                    Update webhook settings.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={saveEditWebhook} className="space-y-3">
                                <div>
                                    <Label htmlFor="edit-webhook-name">Name *</Label>
                                    <Input
                                        id="edit-webhook-name"
                                        placeholder="My Webhook"
                                        value={editWebhookName}
                                        onChange={(e) => setEditWebhookName(e.target.value)}
                                        className="bg-input border-0"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-webhook-subscription">Subscription *</Label>
                                    <Input
                                        id="edit-webhook-subscription"
                                        placeholder="event.created"
                                        value={editWebhookSubscription}
                                        onChange={(e) => setEditWebhookSubscription(e.target.value)}
                                        className="bg-input border-0"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="edit-webhook-url">URL *</Label>
                                    <Input
                                        id="edit-webhook-url"
                                        placeholder="https://example.com/webhook"
                                        value={editWebhookUrl}
                                        onChange={(e) => setEditWebhookUrl(e.target.value)}
                                        className="bg-input border-0"
                                        type="url"
                                        required
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch
                                        id="edit-webhook-enabled"
                                        checked={editWebhookEnabled}
                                        onCheckedChange={setEditWebhookEnabled}
                                    />
                                    <Label htmlFor="edit-webhook-enabled" className="text-sm text-muted-foreground">
                                        {editWebhookEnabled ? "Enabled" : "Disabled"}
                                    </Label>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="cursor-pointer" disabled={isEditingWebhook}>
                                        {isEditingWebhook ? "Saving..." : "Save Changes"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {webhooks.length === 0 ? (
                    <div className="rounded-xl bg-card ring-0">
                        <div className="p-4 text-center">
                            <Empty>
                                <EmptyHeader>
                                    <EmptyTitle>No Webhooks Yet</EmptyTitle>
                                    <EmptyDescription>
                                        Create a webhook to receive real-time events from this project.
                                    </EmptyDescription>
                                </EmptyHeader>
                            </Empty>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        <div className="overflow-hidden rounded-xl bg-card">
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border/40 hover:bg-transparent">
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Name</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">URL</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Subscription</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Status</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Last Triggered</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 text-muted-foreground">Created</TableHead>
                                        <TableHead className="w-fit whitespace-nowrap pl-4 pr-4 text-right text-muted-foreground">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {webhooks
                                        .slice((webhookPage - 1) * WEBHOOKS_PER_PAGE, webhookPage * WEBHOOKS_PER_PAGE)
                                        .map((webhook) => (
                                            <TableRow
                                                key={webhook.id}
                                                className="border-border/40 transition-colors hover:bg-accent/50"
                                            >
                                                <TableCell className="w-fit whitespace-nowrap pl-4 font-medium text-foreground">
                                                    {webhook.name}
                                                </TableCell>
                                                <TableCell className="max-w-[200px] truncate whitespace-nowrap pl-4 text-muted-foreground">
                                                    {webhook.url}
                                                </TableCell>
                                                <TableCell className="w-fit whitespace-nowrap pl-4">
                                                    {webhook.subscription}
                                                </TableCell>
                                                <TableCell className="w-fit whitespace-nowrap pl-4">
                                                    <span className={`text-sm font-medium ${webhook.enabled ? "text-green-500" : "text-muted-foreground"}`}>
                                                        {webhook.enabled ? "Enabled" : "Disabled"}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="w-fit whitespace-nowrap pl-4 text-muted-foreground">
                                                    {webhook.lastTriggered
                                                        ? new Date(webhook.lastTriggered).toLocaleString()
                                                        : "Never"}
                                                </TableCell>
                                                <TableCell className="w-fit whitespace-nowrap pl-4 text-muted-foreground">
                                                    {new Date(webhook.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="w-fit whitespace-nowrap pl-4 pr-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            className="h-7 text-xs"
                                                            onClick={() => openEditWebhook(webhook)}
                                                        >
                                                            Edit
                                                        </Button>
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
                                                                    <AlertDialogTitle>Delete Webhook?</AlertDialogTitle>
                                                                    <AlertDialogDescription>
                                                                        This will permanently delete the &quot;{webhook.name}&quot; webhook.
                                                                    </AlertDialogDescription>
                                                                </AlertDialogHeader>
                                                                <AlertDialogFooter>
                                                                    <AlertDialogCancel className="border-0">Cancel</AlertDialogCancel>
                                                                    <AlertDialogAction
                                                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                                        onClick={() => deleteWebhook(webhook.id)}
                                                                    >
                                                                        Delete
                                                                    </AlertDialogAction>
                                                                </AlertDialogFooter>
                                                            </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>

                        {webhooks.length > WEBHOOKS_PER_PAGE && (
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setWebhookPage((p) => Math.max(1, p - 1));
                                            }}
                                            aria-disabled={webhookPage === 1}
                                            className={webhookPage === 1 ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                    {getPageNumbers(webhookPage, Math.ceil(webhooks.length / WEBHOOKS_PER_PAGE)).map((page, idx) =>
                                        page === "..." ? (
                                            <PaginationItem key={`webhook-ellipsis-${idx}`}>
                                                <PaginationEllipsis />
                                            </PaginationItem>
                                        ) : (
                                            <PaginationItem key={page}>
                                                <PaginationLink
                                                    href="#"
                                                    isActive={page === webhookPage}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        setWebhookPage(page);
                                                    }}
                                                    className="border-0"
                                                >
                                                    {page}
                                                </PaginationLink>
                                            </PaginationItem>
                                        )
                                    )}
                                    <PaginationItem>
                                        <PaginationNext
                                            href="#"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setWebhookPage((p) => Math.min(Math.ceil(webhooks.length / WEBHOOKS_PER_PAGE), p + 1));
                                            }}
                                            aria-disabled={webhookPage === Math.ceil(webhooks.length / WEBHOOKS_PER_PAGE)}
                                            className={webhookPage === Math.ceil(webhooks.length / WEBHOOKS_PER_PAGE) ? "pointer-events-none opacity-50" : ""}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        )}
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold">Project Settings</h2>
                </div>
                <div className="rounded-xl bg-card p-4 ring-0">
                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <div className="mb-4">
                            <h3 className="text-sm font-semibold">Project Name</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Change the name of your project as it appears across the dashboard.
                            </p>
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


                    <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
                        <div>
                            <h3 className="text-sm font-semibold ">Delete Project</h3>
                            <p className="mt-1 text-xs text-muted-foreground">
                                Deleting this project removes API keys and events permanently.
                            </p>
                        </div>
                        <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
                            <AlertDialogTrigger asChild>
                                <Button variant="destructive" className="cursor-pointer">
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
        </div>
    );
}
