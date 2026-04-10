"use client";

import { authClient } from "@/client/auth";
import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Folder, GalleryVerticalEnd, Settings } from "lucide-react";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Button } from "@workspace/ui/components/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@workspace/ui/components/dialog";
import { Input } from "@workspace/ui/components/input";
import { Textarea } from "@workspace/ui/components/textarea";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@workspace/ui/components/table";
import {
    Empty,
    EmptyDescription,
    EmptyHeader,
    EmptyTitle,
} from "@workspace/ui/components/empty";

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

export default function KeysPage({ params }: PageProps) {
    const { id } = use(params);
    const { data: session, isPending } = authClient.useSession();

    const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");

    const [createdToken, setCreatedToken] = useState<string | null>(null);
    const [createdTokenLabel, setCreatedTokenLabel] = useState<string | null>(null);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [isTokenDialogOpen, setIsTokenDialogOpen] = useState(false);
    const [hasCopiedToken, setHasCopiedToken] = useState(false);

    const hasName = useMemo(() => name.trim().length > 0, [name]);

    useEffect(() => {
        let cancelled = false;

        async function loadApiKeys() {
            setIsLoading(true);
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
                    setIsLoading(false);
                }
            }
        }

        loadApiKeys();

        return () => {
            cancelled = true;
        };
    }, [id]);

    async function refreshApiKeys() {
        const response = await fetch(`/api/v1/project/${id}/keys`, { method: "GET" });
        if (!response.ok) {
            return;
        }

        const data = (await response.json()) as { apiKeys?: ApiKey[] };
        setApiKeys(data.apiKeys || []);
    }

    async function createApiKey() {
        if (!hasName || isCreating) {
            return;
        }

        setIsCreating(true);
        try {
            const response = await fetch(`/api/v1/project/${id}/keys`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    description,
                }),
            });

            if (!response.ok) {
                return;
            }

            const data = (await response.json()) as {
                token?: string;
                apiKey?: { name?: string };
            };

            setCreatedToken(data.token || null);
            setCreatedTokenLabel(data.apiKey?.name || "New API Key");
            setHasCopiedToken(false);
            setIsCreateDialogOpen(false);
            setIsTokenDialogOpen(true);
            setName("");
            setDescription("");
            await refreshApiKeys();
        } finally {
            setIsCreating(false);
        }
    }

    async function regenerateApiKey(keyId: string, keyName: string) {
        const response = await fetch(`/api/v1/project/${id}/keys/${keyId}/regenerate`, {
            method: "POST",
        });

        if (!response.ok) {
            return;
        }

        const data = (await response.json()) as { token?: string };
        setCreatedToken(data.token || null);
        setCreatedTokenLabel(keyName);
        setHasCopiedToken(false);
        setIsTokenDialogOpen(true);
    }

    async function revokeApiKey(keyId: string) {
        const response = await fetch(`/api/v1/project/${id}/keys/${keyId}`, {
            method: "DELETE",
        });

        if (!response.ok) {
            return;
        }

        await refreshApiKeys();
    }

    async function copyCreatedToken() {
        if (!createdToken) {
            return;
        }

        await navigator.clipboard.writeText(createdToken);
        setHasCopiedToken(true);
    }

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen flex-col bg-background text-white">
            <Navbar
                navItems={[
                    { label: "Projects", path: "/", icon: Folder },
                    { label: "Events", path: "/events", icon: GalleryVerticalEnd },
                    { label: "Settings", path: "/settings", icon: Settings },
                ]}
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
                                    <Link href="/">Project</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbLink asChild>
                                    <Link href={`/projects/${id}`}>Details</Link>
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>API Keys</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="mb-6">
                        <div className="flex items-center justify-between gap-3">
                            <div>
                                <h1 className="text-2xl font-bold">API Keys</h1>
                            </div>
                            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="cursor-pointer">Create API Key</Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Create API Key</DialogTitle>
                                        <DialogDescription>
                                            Create a API key to start tracking events from your project
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="space-y-3">
                                        <Input
                                            placeholder="Name*"
                                            value={name}
                                            onChange={(event) => setName(event.target.value)}
                                        />
                                        <Textarea
                                            placeholder="Description (optional)"
                                            value={description}
                                            onChange={(event) => setDescription(event.target.value)}
                                        />
                                    </div>
                                    <DialogFooter>
                                        <Button
                                            className="cursor-pointer"
                                            onClick={createApiKey}
                                            disabled={!hasName || isCreating}
                                        >
                                            {isCreating ? "Creating..." : "Create API Key"}
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        </div>
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
                        {isLoading ? (
                            <div className="p-4 text-sm text-eventcontent/65">Loading keys...</div>
                        ) : apiKeys.length === 0 ? (
                            <div className="p-4 text-center">
                                <Empty>
                                    <EmptyHeader>
                                        <EmptyTitle>No API Keys Yet</EmptyTitle>
                                        <EmptyDescription>
                                            Create your first key to start tracking events from your project
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
                                                        onClick={() => regenerateApiKey(key.id, key.name)}
                                                    >
                                                        Regenerate
                                                    </Button>
                                                    <Button
                                                        variant="destructive"
                                                        className="cursor-pointer h-8"
                                                        onClick={() => revokeApiKey(key.id)}
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
            </main>
        </div>
    );
}
