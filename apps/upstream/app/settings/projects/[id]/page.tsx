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
import { EllipsisVertical, Folder, GalleryVerticalEnd, Settings, Shield, Trash2, UserPlus } from "lucide-react";
import Navbar from "@/components/navbar";
import Link from "next/link";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@workspace/ui/components/breadcrumb";
import { toast } from "sonner";

type Project = {
    id: string;
    name: string;
    members: {
        id: string;
        role: "ADMIN" | "MEMBER";
        user: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
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

interface PageProps {
    params: Promise<{ id: string }>;
}

export default function Page({ params }: PageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: session, isPending } = authClient.useSession();
    const [project, setProject] = useState<Project | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);
    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isApiKeysLoading, setIsApiKeysLoading] = useState(true);

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

    const currentMembership = project?.members.find((member) => member.user.id === session?.user.id) || null;
    const isCurrentUserAdmin = currentMembership?.role === "ADMIN";
    const hasTokenName = useMemo(() => tokenName.trim().length > 0, [tokenName]);

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

                const data = (await response.json()) as { project: Project };

                if (!cancelled) {
                    setProject(data.project || null);
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

    async function refreshProject() {
        const response = await fetch(`/api/v1/project/${id}`, { method: "GET" });
        if (!response.ok) {
            return;
        }

        const data = (await response.json()) as { project: Project };
        setProject(data.project || null);
    }

    async function refreshApiKeys() {
        const response = await fetch(`/api/v1/project/${id}/keys`, { method: "GET" });
        if (!response.ok) {
            return;
        }

        const data = (await response.json()) as { apiKeys?: ApiKey[] };
        setApiKeys(data.apiKeys || []);
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
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    email,
                    role: inviteRole,
                }),
            });

            if (!response.ok) {
                const errorData = (await response.json().catch(() => ({}))) as { error?: string };
                toast.error(errorData.error || "Failed to invite member");
                return;
            }

            toast("Member invited");
            setInviteEmail("");
            setInviteRole("MEMBER");
            setIsInviteDialogOpen(false);
            await refreshProject();
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
            description: "You will lose access and must be re-added by an admin.",
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

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
    }

    if (isProjectLoading) {
        return <div>Loading...</div>;
    }

    if (!project) {
        return <div>404</div>;
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-white">
            <Navbar
                navItems={
                    [
                        { label: "Projects", path: "/", icon: Folder },
                        { label: "Events", path: "/events", icon: GalleryVerticalEnd },
                        { label: "Settings", path: "/settings", icon: Settings },
                    ]
                }
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

                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-bold">{project.name}</h1>
                    </div>

                    <div className="mb-8 mt-4">
                        <div className="flex items-center justify-between mb-3">
                            <h2 className="text-sm font-semibold">API Tokens</h2>
                            <Dialog open={isCreateTokenDialogOpen} onOpenChange={setIsCreateTokenDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="cursor-pointer" disabled={!isCurrentUserAdmin}>Create API Key</Button>
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
                                                            disabled={!isCurrentUserAdmin}
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
                                                            disabled={!isCurrentUserAdmin}
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
                                    <Button className="cursor-pointer" disabled={!isCurrentUserAdmin}>
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
                                                const canManageOthers = isCurrentUserAdmin && !isSelf;
                                                const hasActions = canManageOthers || isSelf;
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
                                                                        {isSelf && (
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
                                disabled={!isCurrentUserAdmin}
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
