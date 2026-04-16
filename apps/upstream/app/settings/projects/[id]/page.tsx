"use client";

import { authClient } from "@/client/auth"
import { redirect, useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@workspace/ui/components/empty"
import { EllipsisVertical, Trash2, Globe, ToggleLeft, ToggleRight, Copy, Check, MailX } from "lucide-react";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { Switch } from "@workspace/ui/components/switch";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { toast } from "sonner";

type Project = {
    id: string;
    name: string;
    members: {
        id: string;
        role: "OWNER" | "ADMIN" | "MEMBER";
        user: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
    }[];
    auditLogs: {
        id: string;
        action: string;
        title: string;
        description: string | null;
        createdAt: string;
        actor: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        } | null;
        metadata: Record<string, unknown> | null;
    }[];
};

type ApiKey = {
    id: string;
    name: string;
    description: string | null;
    createdAt: string;
    expiresAt: string | null;
    createdBy: {
        name: string;
        email: string;
    };
};

type Webhook = {
    id: string;
    name: string;
    url: string;
    enabled: boolean;
    createdAt: string;
};

type Invitation = {
    id: string;
    email: string;
    role: "ADMIN" | "MEMBER";
    createdAt: string;
    expiresAt: string;
};

interface PageProps {
    params: Promise<{ id: string }>;
}

function normalizeProject(project: Project | null | undefined): Project | null {
    if (!project) {
        return null;
    }

    return {
        ...project,
        members: Array.isArray(project.members) ? project.members : [],
        auditLogs: Array.isArray(project.auditLogs) ? project.auditLogs : [],
    };
}

export default function Page({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [project, setProject] = useState<Project | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isApiKeysLoading, setIsApiKeysLoading] = useState(true);

    const [webhooks, setWebhooks] = useState<Webhook[]>([]);
    const [isWebhooksLoading, setIsWebhooksLoading] = useState(true);
    const [isCreateWebhookOpen, setIsCreateWebhookOpen] = useState(false);
    const [isWebhookSecretOpen, setIsWebhookSecretOpen] = useState(false);
    const [webhookName, setWebhookName] = useState("");
    const [webhookUrl, setWebhookUrl] = useState("");
    const [isCreatingWebhook, setIsCreatingWebhook] = useState(false);
    const [createdWebhookSecret, setCreatedWebhookSecret] = useState<string | null>(null);
    const [hasCopiedWebhookSecret, setHasCopiedWebhookSecret] = useState(false);

    const [invitations, setInvitations] = useState<Invitation[]>([]);

    const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState<"ADMIN" | "MEMBER">("MEMBER");
    const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

    const [isCreateTokenDialogOpen, setIsCreateTokenDialogOpen] = useState(false);
    const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
    const [tokenName, setTokenName] = useState("");
    const [tokenDescription, setTokenDescription] = useState("");
    const [isCreatingToken, setIsCreatingToken] = useState(false);
    const [createdToken, setCreatedToken] = useState<string | null>(null);
    const [hasCopiedToken, setHasCopiedToken] = useState(false);

    const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false);
    const [renameName, setRenameName] = useState("");
    const [isRenamingProject, setIsRenamingProject] = useState(false);

    const [activeMemberAction, setActiveMemberAction] = useState<{
        memberId: string;
        kind: "role" | "remove";
    } | null>(null);
    const [isProcessingMemberAction, setIsProcessingMemberAction] = useState(false);

    const [confirmState, setConfirmState] = useState<{
        open: boolean;
        title: string;
        description: string;
        actionLabel: string;
        variant: "default" | "destructive";
        onConfirm: () => Promise<void>;
    } | null>(null);

    const [isConfirming, setIsConfirming] = useState(false);

    const currentMembership = project?.members?.find((member) => member.user.id === session?.user.id) || null;
    const isCurrentUserManager = currentMembership?.role === "OWNER" || currentMembership?.role === "ADMIN";
    const hasTokenName = useMemo(() => tokenName.trim().length > 0, [tokenName]);
    const hasRenameName = useMemo(() => renameName.trim().length > 0, [renameName]);

    function getAuditActionLabel(action: string) {
        switch (action) {
            case "project.created":
                return "Project created";
            case "project.renamed":
                return "Project renamed";
            case "member.invited":
                return "Member invited";
            case "member.role_updated":
                return "Member role updated";
            case "member.removed":
                return "Member removed";
            case "member.left":
                return "Member left";
            case "api_key.created":
                return "API key created";
            case "api_key.regenerated":
                return "API key regenerated";
            case "api_key.revoked":
                return "API key revoked";
            case "member.invitation_accepted":
                return "Invitation accepted";
            case "webhook.created":
                return "Webhook created";
            case "webhook.updated":
                return "Webhook updated";
            case "webhook.deleted":
                return "Webhook deleted";
            default:
                return action;
        }
    }

    useEffect(() => {
        let cancelled = false;

        async function loadProject() {
            setIsProjectLoading(true);
            try {
                const response = await fetch(`/api/v1/project/${id}`, { method: "GET" });

                if (!response.ok) {
                    if (!cancelled) {
                        setProject(null);
                    }
                    return;
                }

                const data = (await response.json()) as { project?: Project | null };

                if (!cancelled) {
                    setProject(normalizeProject(data.project));
                }
            } finally {
                if (!cancelled) {
                    setIsProjectLoading(false);
                }
            }
        }

        loadProject();

        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        let cancelled = false;

        async function loadApiKeys() {
            setIsApiKeysLoading(true);

            try {
                const response = await fetch(`/api/v1/project/${id}/keys`, { method: "GET" });

                if (!response.ok) {
                    if (!cancelled) {
                        setApiKeys([]);
                    }
                    return;
                }

                const data = (await response.json()) as { apiKeys?: ApiKey[] };

                if (!cancelled) {
                    setApiKeys(data.apiKeys || []);
                }
            } finally {
                if (!cancelled) {
                    setIsApiKeysLoading(false);
                }
            }
        }

        loadApiKeys();

        return () => {
            cancelled = true;
        };
    }, [id]);

    useEffect(() => {
        let cancelled = false;
        async function loadWebhooks() {
            setIsWebhooksLoading(true);
            try {
                const res = await fetch(`/api/v1/project/${id}/webhooks`);
                if (!res.ok) return;
                const data = (await res.json()) as { webhooks?: Webhook[] };
                if (!cancelled) setWebhooks(data.webhooks ?? []);
            } finally {
                if (!cancelled) setIsWebhooksLoading(false);
            }
        }
        loadWebhooks();
        return () => { cancelled = true; };
    }, [id]);

    useEffect(() => {
        let cancelled = false;
        async function loadInvitations() {
            const res = await fetch(`/api/v1/project/${id}/invitations`);
            if (!res.ok) return;
            const data = (await res.json()) as { invitations?: Invitation[] };
            if (!cancelled) setInvitations(data.invitations ?? []);
        }
        loadInvitations();
        return () => { cancelled = true; };
    }, [id]);

    async function refreshProject() {
        const response = await fetch(`/api/v1/project/${id}`, { method: "GET" });
        if (!response.ok) {
            return;
        }

        const data = (await response.json()) as { project?: Project | null };
        setProject(normalizeProject(data.project));
    }

    function openRenameDialog() {
        setRenameName(project?.name || "");
        setIsRenameDialogOpen(true);
    }

    async function renameProject() {
        const name = renameName.trim();

        if (!name || isRenamingProject) {
            return;
        }

        setIsRenamingProject(true);

        try {
            const response = await fetch(`/api/v1/project/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                const errorData = (await response.json().catch(() => ({}))) as { error?: string };
                toast.error(errorData.error || "Failed to rename project");
                return;
            }

            const data = (await response.json()) as { project?: Project | null };
            setProject(normalizeProject(data.project));
            setIsRenameDialogOpen(false);
            toast("Project renamed");
            await refreshProject();
        } finally {
            setIsRenamingProject(false);
        }
    }

    async function refreshApiKeys() {
        const response = await fetch(`/api/v1/project/${id}/keys`, { method: "GET" });
        if (!response.ok) {
            return;
        }

        const data = (await response.json()) as { apiKeys?: ApiKey[] };
        setApiKeys(data.apiKeys || []);
    }

    async function refreshWebhooks() {
        const res = await fetch(`/api/v1/project/${id}/webhooks`);
        if (!res.ok) return;
        const data = (await res.json()) as { webhooks?: Webhook[] };
        setWebhooks(data.webhooks ?? []);
    }

    async function refreshInvitations() {
        const res = await fetch(`/api/v1/project/${id}/invitations`);
        if (!res.ok) return;
        const data = (await res.json()) as { invitations?: Invitation[] };
        setInvitations(data.invitations ?? []);
    }

    async function createWebhook() {
        if (!webhookName.trim() || !webhookUrl.trim() || isCreatingWebhook) return;
        setIsCreatingWebhook(true);
        try {
            const res = await fetch(`/api/v1/project/${id}/webhooks`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: webhookName, url: webhookUrl }),
            });
            const data = (await res.json()) as { webhook?: Webhook; secret?: string; error?: string };
            if (!res.ok) { toast.error(data.error ?? "Failed to create webhook"); return; }
            setCreatedWebhookSecret(data.secret ?? null);
            setHasCopiedWebhookSecret(false);
            setWebhookName("");
            setWebhookUrl("");
            setIsCreateWebhookOpen(false);
            setIsWebhookSecretOpen(true);
            toast("Webhook created");
            await refreshWebhooks();
        } finally {
            setIsCreatingWebhook(false);
        }
    }

    async function toggleWebhook(webhookId: string, enabled: boolean) {
        const res = await fetch(`/api/v1/project/${id}/webhooks/${webhookId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled }),
        });
        if (!res.ok) { toast.error("Failed to update webhook"); return; }
        await refreshWebhooks();
    }

    async function deleteWebhook(webhookId: string) {
        setConfirmState({
            open: true,
            title: "Delete webhook?",
            description: "Events will no longer be delivered to this endpoint.",
            actionLabel: "Delete",
            variant: "destructive",
            onConfirm: async () => {
                const res = await fetch(`/api/v1/project/${id}/webhooks/${webhookId}`, { method: "DELETE" });
                if (!res.ok) { toast.error("Failed to delete webhook"); return; }
                toast("Webhook deleted");
                await refreshWebhooks();
            },
        });
    }

    async function revokeInvitation(invitationId: string) {
        const res = await fetch(`/api/v1/project/${id}/invitations/${invitationId}`, { method: "DELETE" });
        if (!res.ok) { toast.error("Failed to revoke invitation"); return; }
        toast("Invitation revoked");
        await refreshInvitations();
    }

    async function createApiKey() {
        if (!hasTokenName || isCreatingToken) {
            return;
        }

        setIsCreatingToken(true);

        try {
            const response = await fetch(`/api/v1/project/${id}/keys`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name: tokenName,
                    description: tokenDescription,
                }),
            });

            if (!response.ok) {
                const errorData = (await response.json().catch(() => ({}))) as { error?: string };
                toast.error(errorData.error || "Failed to create API key");
                return;
            }

            const data = (await response.json()) as { token?: string };

            setCreatedToken(data.token || null);
            setHasCopiedToken(false);
            setTokenName("");
            setTokenDescription("");
            setIsCreateTokenDialogOpen(false);
            setIsTokenDialogOpen(true);
            toast("API key created");
            await refreshApiKeys();
        } finally {
            setIsCreatingToken(false);
        }
    }

    async function regenerateApiKey(keyId: string) {
        const response = await fetch(`/api/v1/project/${id}/keys/${keyId}/regenerate`, {
            method: "POST",
        });

        if (!response.ok) {
            const errorData = (await response.json().catch(() => ({}))) as { error?: string };
            toast.error(errorData.error || "Failed to regenerate key");
            return;
        }

        const data = (await response.json()) as { token?: string };
        setCreatedToken(data.token || null);
        setHasCopiedToken(false);
        setIsTokenDialogOpen(true);
        toast("API key regenerated");
    }

    async function revokeApiKey(keyId: string) {
        const response = await fetch(`/api/v1/project/${id}/keys/${keyId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = (await response.json().catch(() => ({}))) as { error?: string };
            toast.error(errorData.error || "Failed to revoke key");
            return;
        }

        toast("API key revoked");
        await refreshApiKeys();
    }

    async function copyCreatedToken() {
        if (!createdToken) {
            return;
        }

        await navigator.clipboard.writeText(createdToken);
        setHasCopiedToken(true);
    }

    async function deleteProject() {
        const response = await fetch(`/api/v1/project/${id}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            const errorData = (await response.json().catch(() => ({}))) as { error?: string };
            toast.error(errorData.error || "Failed to delete project");
            return;
        }

        toast("Project deleted");
        router.push("/settings/projects");
    }

    async function inviteMember() {
        const email = inviteEmail.trim().toLowerCase();

        if (!email || isSubmittingInvite) {
            return;
        }

        setIsSubmittingInvite(true);

        try {
            const response = await fetch(`/api/v1/project/${id}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, role: inviteRole }),
            });

            const data = (await response.json().catch(() => ({}))) as { invited?: boolean; error?: string };

            if (!response.ok) {
                toast.error(data.error || "Failed to invite member");
                return;
            }

            if (data.invited) {
                toast(`Invitation sent to ${email}`);
                await refreshInvitations();
            } else {
                toast("Member role updated");
                await refreshProject();
            }

            setInviteEmail("");
            setInviteRole("MEMBER");
            setIsInviteDialogOpen(false);
        } finally {
            setIsSubmittingInvite(false);
        }
    }

    async function changeMemberRole(memberId: string, role: "ADMIN" | "MEMBER") {
        if (isProcessingMemberAction) {
            return;
        }

        setIsProcessingMemberAction(true);
        setActiveMemberAction({ memberId, kind: "role" });

        try {
            const response = await fetch(`/api/v1/project/${id}/members/${memberId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ role }),
            });

            if (!response.ok) {
                const errorData = (await response.json().catch(() => ({}))) as { error?: string };
                toast.error(errorData.error || "Failed to update role");
                return;
            }

            toast("Member role updated");
            await refreshProject();
        } finally {
            setActiveMemberAction(null);
            setIsProcessingMemberAction(false);
        }
    }

    async function removeMember(memberId: string, isSelf: boolean) {
        if (isProcessingMemberAction) {
            return;
        }

        setIsProcessingMemberAction(true);
        setActiveMemberAction({ memberId, kind: "remove" });

        try {
            const response = await fetch(`/api/v1/project/${id}/members/${memberId}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                const errorData = (await response.json().catch(() => ({}))) as { error?: string };
                toast.error(errorData.error || "Failed to remove member");
                return;
            }

            if (isSelf) {
                toast("You left the project");
                router.push("/settings/projects");
                return;
            }

            toast("Member removed");
            await refreshProject();
        } finally {
            setActiveMemberAction(null);
            setIsProcessingMemberAction(false);
        }
    }

    function openRoleConfirm(memberId: string, memberName: string, nextRole: "ADMIN" | "MEMBER") {
        setConfirmState({
            open: true,
            title: nextRole === "ADMIN" ? "Promote to admin?" : "Set as member?",
            description: nextRole === "ADMIN"
                ? `${memberName} will be able to invite, remove, and manage roles.`
                : `${memberName} will no longer be able to manage project members.`,
            actionLabel: nextRole === "ADMIN" ? "Make Admin" : "Set Member",
            variant: "default",
            onConfirm: async () => {
                await changeMemberRole(memberId, nextRole);
            },
        });
    }

    function openKickConfirm(memberId: string, memberName: string) {
        setConfirmState({
            open: true,
            title: "Kick member?",
            description: `${memberName} will immediately lose project access.`,
            actionLabel: "Kick Member",
            variant: "destructive",
            onConfirm: async () => {
                await removeMember(memberId, false);
            },
        });
    }

    function openLeaveConfirm(memberId: string) {
        setConfirmState({
            open: true,
            title: "Leave project?",
            description: "You will lose access and must be re-added by an owner or admin.",
            actionLabel: "Leave Project",
            variant: "destructive",
            onConfirm: async () => {
                await removeMember(memberId, true);
            },
        });
    }

    async function runConfirmAction() {
        if (!confirmState || isConfirming) {
            return;
        }

        setIsConfirming(true);

        try {
            await confirmState.onConfirm();
            setConfirmState(null);
        } finally {
            setIsConfirming(false);
        }
    }

    if (isPending || isProjectLoading) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-white">
                <Navbar user={{}} />
                <main className="flex-1 flex justify-center">
                    <div className="w-full max-w-2xl p-6 space-y-4">
                        <Skeleton className="h-4 w-56" />
                        <Skeleton className="h-9 w-48" />
                        <Skeleton className="h-48 rounded-xl" />
                        <Skeleton className="h-48 rounded-xl" />
                    </div>
                </main>
            </div>
        );
    }

    if (!session) {
        redirect("/login");
    }

    if (!project) {
        return (
            <div className="flex min-h-screen flex-col bg-background text-white">
                <Navbar
                    user={{
                        name: session.user.name,
                        email: session.user.email,
                        image: session.user.image || "",
                    }}
                />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center space-y-2">
                        <p className="text-2xl font-semibold">Project not found</p>
                        <p className="text-sm text-eventcontent/65">This project doesn&apos;t exist or you don&apos;t have access.</p>
                        <Link href="/settings/projects" className="inline-block mt-4">
                            <Button variant="secondary" size="sm">Back to projects</Button>
                        </Link>
                    </div>
                </main>
            </div>
        );
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

            <main className="flex-1 flex justify-center">

                <div className="w-full max-w-2xl p-6">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/settings">Settings</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href="/settings/projects">Manage Projects</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{project.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                            <h1 className="truncate text-2xl font-bold">{project.name}</h1>
                        </div>
                        <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="secondary"
                                    className="cursor-pointer"
                                    disabled={!isCurrentUserManager}
                                    onClick={openRenameDialog}
                                >
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
                                    <Input
                                        placeholder="Project name"
                                        value={renameName}
                                        onChange={(event) => setRenameName(event.target.value)}
                                        disabled={isRenamingProject}
                                    />
                                </div>
                                <DialogFooter>
                                    <Button
                                        className="cursor-pointer"
                                        onClick={renameProject}
                                        disabled={!hasRenameName || isRenamingProject}
                                    >
                                        {isRenamingProject ? "Renaming..." : "Save Changes"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="mb-8 mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold">API Tokens</h2>
                            <Dialog open={isCreateTokenDialogOpen} onOpenChange={setIsCreateTokenDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="cursor-pointer" disabled={!isCurrentUserManager}>Create API Key</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Create API Key</DialogTitle>
                                        <DialogDescription>
                                            Create a key to send events to this project.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Name*"
                                            value={tokenName}
                                            onChange={(event) => setTokenName(event.target.value)}
                                            disabled={isCreatingToken}
                                        />
                                        <Textarea
                                            placeholder="Description (optional)"
                                            value={tokenDescription}
                                            onChange={(event) => setTokenDescription(event.target.value)}
                                            disabled={isCreatingToken}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            className="cursor-pointer"
                                            onClick={createApiKey}
                                            disabled={!hasTokenName || isCreatingToken}
                                        >
                                            {isCreatingToken ? "Creating..." : "Create API Key"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
                            <DialogContent className="sm:max-w-2xl">
                                <DialogHeader>
                                    <DialogTitle>Your API Key</DialogTitle>
                                    <DialogDescription>
                                        This is the only time we can show the secret for this API key.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="rounded-md bg-black/30 p-3 font-mono text-xs break-all">
                                    {createdToken}
                                </div>
                                <DialogFooter>
                                    <Button onClick={copyCreatedToken} className="cursor-pointer">
                                        {hasCopiedToken ? "Copied" : "Copy"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <div className="rounded-lg bg-card ring-1 ring-white/5">
                            {isApiKeysLoading ? (
                                <div className="p-4 text-sm text-eventcontent/65">Loading keys...</div>
                            ) : apiKeys.length === 0 ? (
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
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/10">
                                            <TableHead className="px-4">Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Created</TableHead>
                                            <TableHead className="w-44">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {apiKeys.map((key) => (
                                            <TableRow key={key.id} className="border-white/10 hover:bg-white/5">
                                                <TableCell className="px-4">
                                                    <p className="font-medium">{key.name}</p>
                                                    <p className="text-xs text-eventcontent/65">by {key.createdBy.name || key.createdBy.email}</p>
                                                </TableCell>
                                                <TableCell className="text-xs text-eventcontent/65 max-w-48 truncate">
                                                    {key.description || "-"}
                                                </TableCell>
                                                <TableCell className="text-xs text-eventcontent/65">
                                                    {new Date(key.createdAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            variant="secondary"
                                                            className="cursor-pointer h-8"
                                                            onClick={() => regenerateApiKey(key.id)}
                                                            disabled={!isCurrentUserManager}
                                                        >
                                                            Regenerate
                                                        </Button>
                                                        <Button
                                                            variant="destructive"
                                                            className="cursor-pointer h-8"
                                                            onClick={() => {
                                                                setConfirmState({
                                                                    open: true,
                                                                    title: "Revoke API key?",
                                                                    description: `${key.name} will stop working immediately.`,
                                                                    actionLabel: "Revoke",
                                                                    variant: "destructive",
                                                                    onConfirm: async () => {
                                                                        await revokeApiKey(key.id);
                                                                    },
                                                                });
                                                            }}
                                                            disabled={!isCurrentUserManager}
                                                        >
                                                            Revoke
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-3 mt-4">
                            <h2 className="text-sm font-semibold">Members</h2>
                            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="cursor-pointer" disabled={!isCurrentUserManager}>
                                        Invite Member
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Invite Member</DialogTitle>
                                        <DialogDescription>
                                            Invite someone by email and select role.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="name@example.com"
                                            value={inviteEmail}
                                            onChange={(event) => setInviteEmail(event.target.value)}
                                            disabled={isSubmittingInvite}
                                        />
                                        <div className="flex gap-2">
                                            <Button
                                                type="button"
                                                variant={inviteRole === "MEMBER" ? "default" : "secondary"}
                                                onClick={() => setInviteRole("MEMBER")}
                                                disabled={isSubmittingInvite}
                                            >
                                                Member
                                            </Button>
                                            <Button
                                                type="button"
                                                variant={inviteRole === "ADMIN" ? "default" : "secondary"}
                                                onClick={() => setInviteRole("ADMIN")}
                                                disabled={isSubmittingInvite}
                                            >
                                                Admin
                                            </Button>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            className="cursor-pointer"
                                            onClick={inviteMember}
                                            disabled={isSubmittingInvite || inviteEmail.trim().length === 0}
                                        >
                                            {isSubmittingInvite ? "Inviting..." : "Send Invite"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <div className="space-y-2">
                            {project.members.length === 0 ? (
                                <div className="rounded-lg bg-card p-4 ring-1 ring-white/5 text-center">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyTitle>No Members Yet</EmptyTitle>
                                            <EmptyDescription>
                                                There are no members assigned to this project yet.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </div>
                            ) : (
                                <div className="rounded-lg bg-card ring-1 ring-white/5">
                                    <Table>
                                        <TableHeader>
                                            <TableRow className="border-white/10">
                                                <TableHead className="px-4">Member</TableHead>
                                                <TableHead>Email</TableHead>
                                                <TableHead className="w-28">Role</TableHead>
                                                <TableHead className="w-20 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {project.members.map((member) => {
                                                const initial = member.user.name?.charAt(0).toUpperCase() || "U";
                                                const isSelf = member.user.id === session.user.id;
                                                const isOwner = member.role === "OWNER";
                                                const canManageOthers = isCurrentUserManager && !isSelf && !isOwner;
                                                const canLeaveSelf = isSelf && !isOwner;
                                                const hasActions = canManageOthers || canLeaveSelf;
                                                const isRowActionBusy =
                                                    isProcessingMemberAction &&
                                                    activeMemberAction?.memberId === member.id;

                                                return (
                                                    <TableRow key={member.id} className="border-white/10 hover:bg-white/5">
                                                        <TableCell className="px-4">
                                                            <div className="flex min-w-0 items-center gap-3">
                                                                <Avatar className="size-8">
                                                                    <AvatarImage src={member.user.image || undefined} alt={member.user.name} />
                                                                    <AvatarFallback>{initial}</AvatarFallback>
                                                                </Avatar>
                                                                <p className="truncate text-sm font-medium text-white">{member.user.name}</p>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell>
                                                            <p className="truncate text-xs text-eventcontent/65">{member.user.email}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-white/80">
                                                                {member.role}
                                                            </span>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {hasActions && (
                                                                <DropdownMenu>
                                                                    <DropdownMenuTrigger asChild>
                                                                        <Button variant="ghost" size="icon-sm" className="cursor-pointer" disabled={isRowActionBusy}>
                                                                            <EllipsisVertical className="size-4" />
                                                                        </Button>
                                                                    </DropdownMenuTrigger>
                                                                    <DropdownMenuContent align="end" className="w-44">
                                                                        {canManageOthers && member.role !== "ADMIN" && (
                                                                            <DropdownMenuItem onSelect={() => openRoleConfirm(member.id, member.user.name, "ADMIN")}>Make Admin</DropdownMenuItem>
                                                                        )}
                                                                        {canManageOthers && member.role !== "MEMBER" && (
                                                                            <DropdownMenuItem onSelect={() => openRoleConfirm(member.id, member.user.name, "MEMBER")}>Make Member</DropdownMenuItem>
                                                                        )}
                                                                        {canManageOthers && (
                                                                            <DropdownMenuItem
                                                                                onSelect={() => openKickConfirm(member.id, member.user.name)}
                                                                                className="text-red-300 focus:text-red-200"
                                                                            >
                                                                                Kick Member
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                        {canLeaveSelf && (
                                                                            <DropdownMenuItem
                                                                                onSelect={() => openLeaveConfirm(member.id)}
                                                                                className="text-red-300 focus:text-red-200"
                                                                            >
                                                                                Leave Project
                                                                            </DropdownMenuItem>
                                                                        )}
                                                                    </DropdownMenuContent>
                                                                </DropdownMenu>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Pending Invitations ── */}
                    {invitations.length > 0 && (
                        <div className="mt-4">
                            <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-eventcontent/65">
                                Pending Invitations
                            </h3>
                            <div className="rounded-lg bg-card ring-1 ring-white/5">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/10">
                                            <TableHead className="px-4">Email</TableHead>
                                            <TableHead className="w-28">Role</TableHead>
                                            <TableHead className="w-36">Expires</TableHead>
                                            <TableHead className="w-24 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {invitations.map((inv) => (
                                            <TableRow key={inv.id} className="border-white/10 hover:bg-white/5">
                                                <TableCell className="px-4">
                                                    <div className="flex items-center gap-2">
                                                        <MailX className="size-3.5 text-eventcontent/40 shrink-0" />
                                                        <span className="text-sm text-eventcontent/80">{inv.email}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium text-white/80">{inv.role}</span>
                                                </TableCell>
                                                <TableCell className="text-xs text-eventcontent/65">
                                                    {new Date(inv.expiresAt).toLocaleDateString()}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="cursor-pointer h-8 text-eventcontent/60 hover:text-red-300" onClick={() => revokeInvitation(inv.id)} disabled={!isCurrentUserManager}>
                                                        Revoke
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </div>
                    )}

                    {/* ── Webhooks ── */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold">Webhooks</h2>
                            <Dialog open={isCreateWebhookOpen} onOpenChange={setIsCreateWebhookOpen}>
                                <DialogTrigger asChild>
                                    <Button className="cursor-pointer" disabled={!isCurrentUserManager}>Add Webhook</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Add Webhook</DialogTitle>
                                        <DialogDescription>
                                            Upstream will POST a signed payload to this URL every time an event is tracked.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <Input placeholder="Name (e.g. Slack alerts)" value={webhookName} onChange={(e) => setWebhookName(e.target.value)} disabled={isCreatingWebhook} />
                                        <Input placeholder="https://your-server.com/webhook" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} disabled={isCreatingWebhook} />
                                    </div>
                                    <DialogFooter>
                                        <Button onClick={createWebhook} disabled={!webhookName.trim() || !webhookUrl.trim() || isCreatingWebhook} className="cursor-pointer">
                                            {isCreatingWebhook ? "Creating..." : "Create Webhook"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>

                        {/* Webhook secret one-time reveal */}
                        <Dialog open={isWebhookSecretOpen} onOpenChange={setIsWebhookSecretOpen}>
                            <DialogContent className="sm:max-w-xl">
                                <DialogHeader>
                                    <DialogTitle>Webhook Secret</DialogTitle>
                                    <DialogDescription>
                                        Use this to verify the <code>X-Upstream-Signature</code> header on incoming requests. This is shown only once.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="rounded-md bg-black/30 p-3 font-mono text-xs break-all select-all">{createdWebhookSecret}</div>
                                <DialogFooter>
                                    <Button onClick={async () => { if (createdWebhookSecret) { await navigator.clipboard.writeText(createdWebhookSecret); setHasCopiedWebhookSecret(true); } }} className="cursor-pointer">
                                        {hasCopiedWebhookSecret ? "Copied" : "Copy Secret"}
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>

                        <div className="rounded-lg bg-card ring-1 ring-white/5">
                            {isWebhooksLoading ? (
                                <div className="p-4 text-sm text-eventcontent/65">Loading webhooks...</div>
                            ) : webhooks.length === 0 ? (
                                <div className="p-4 text-center">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyTitle>No Webhooks Yet</EmptyTitle>
                                            <EmptyDescription>Add a webhook to receive HTTP callbacks when events are tracked.</EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/10">
                                            <TableHead className="px-4">Endpoint</TableHead>
                                            <TableHead className="w-24 text-center">Enabled</TableHead>
                                            <TableHead className="w-24">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {webhooks.map((wh) => (
                                            <TableRow key={wh.id} className="border-white/10 hover:bg-white/5">
                                                <TableCell className="px-4">
                                                    <p className="font-medium">{wh.name}</p>
                                                    <p className="text-xs text-eventcontent/55 flex items-center gap-1 mt-0.5">
                                                        <Globe className="size-3" />{wh.url}
                                                    </p>
                                                </TableCell>
                                                <TableCell className="text-center">
                                                    <Switch
                                                        checked={wh.enabled}
                                                        onCheckedChange={(enabled) => toggleWebhook(wh.id, enabled)}
                                                        disabled={!isCurrentUserManager}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    <Button variant="destructive" size="sm" className="cursor-pointer h-8" onClick={() => deleteWebhook(wh.id)} disabled={!isCurrentUserManager}>
                                                        Delete
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </div>
                        <p className="mt-2 text-xs text-eventcontent/45">
                            Each request includes <code className="text-eventcontent/65">X-Upstream-Signature</code> (HMAC-SHA256) and <code className="text-eventcontent/65">X-Upstream-Timestamp</code> headers.
                        </p>
                    </div>

                    {/* ── Audit Logs ── */}
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold">Audit Logs</h2>
                        </div>

                        <div className="rounded-lg bg-card ring-1 ring-white/5">
                            {project.auditLogs.length === 0 ? (
                                <div className="p-4 text-center">
                                    <Empty>
                                        <EmptyHeader>
                                            <EmptyTitle>No Audit Logs Yet</EmptyTitle>
                                            <EmptyDescription>
                                                Project changes, member actions, and API key updates will appear here.
                                            </EmptyDescription>
                                        </EmptyHeader>
                                    </Empty>
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-white/10">
                                            <TableHead className="px-4">Action</TableHead>
                                            <TableHead>Actor</TableHead>
                                            <TableHead>Details</TableHead>
                                            <TableHead className="w-40">When</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {project.auditLogs.map((log) => {
                                            const actorName = log.actor?.name || "System";
                                            const actorEmail = log.actor?.email || "Automated";
                                            const actorInitial = actorName.charAt(0).toUpperCase();

                                            return (
                                                <TableRow key={log.id} className="border-white/10 hover:bg-white/5">
                                                    <TableCell className="px-4 font-medium">
                                                        {getAuditActionLabel(log.action)}
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="size-8">
                                                                <AvatarImage src={log.actor?.image || undefined} alt={actorName} />
                                                                <AvatarFallback>{actorInitial}</AvatarFallback>
                                                            </Avatar>
                                                            <div className="min-w-0">
                                                                <p className="truncate text-sm font-medium text-white">{actorName}</p>
                                                                <p className="truncate text-xs text-eventcontent/65">{actorEmail}</p>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="text-xs text-eventcontent/65 max-w-64 truncate">
                                                        {log.description || "-"}
                                                    </TableCell>
                                                    <TableCell className="text-xs text-eventcontent/65">
                                                        {new Date(log.createdAt).toLocaleString()}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            )}
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
                            <Button
                                variant="destructive"
                                className="cursor-pointer"
                                disabled={!isCurrentUserManager}
                                onClick={() => {
                                    setConfirmState({
                                        open: true,
                                        title: "Delete project permanently?",
                                        description: "This cannot be undone. All project data will be removed.",
                                        actionLabel: "Delete Project",
                                        variant: "destructive",
                                        onConfirm: async () => {
                                            await deleteProject();
                                        },
                                    });
                                }}
                            >
                                <Trash2 className="mr-1 size-4" />
                                Delete Project
                            </Button>
                        </div>
                    </div>
                </div>

                <Dialog
                    open={confirmState?.open || false}
                    onOpenChange={(open) => {
                        if (!open) {
                            setConfirmState(null);
                        }
                    }}
                >
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>{confirmState?.title}</DialogTitle>
                            <DialogDescription>{confirmState?.description}</DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="secondary" onClick={() => setConfirmState(null)} disabled={isConfirming}>Cancel</Button>
                            <Button variant={confirmState?.variant || "default"} onClick={runConfirmAction} disabled={isConfirming}>
                                {isConfirming ? "Working..." : (confirmState?.actionLabel || "Confirm")}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </main >
        </div >
    )
}
