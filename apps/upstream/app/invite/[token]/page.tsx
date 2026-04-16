"use client";

import { use, useEffect, useState } from "react";
import { authClient } from "@/client/auth";
import { useRouter } from "next/navigation";
import { Button } from "@workspace/ui/components/button";
import { Skeleton } from "@workspace/ui/components/skeleton";
import { CheckCircle, XCircle, LogIn } from "lucide-react";
import Link from "next/link";

interface PageProps {
    params: Promise<{ token: string }>;
}

type InvitationDetails = {
    id: string;
    email: string;
    role: string;
    expiresAt: string;
    project: { id: string; name: string };
    invitedBy: { name: string; email: string };
};

type PageState =
    | { kind: "loading" }
    | { kind: "not_found" }
    | { kind: "expired" }
    | { kind: "already_accepted" }
    | { kind: "ready"; invitation: InvitationDetails }
    | { kind: "accepted"; projectId: string; projectName: string }
    | { kind: "error"; message: string };

export default function Page({ params }: PageProps) {
    const { token } = use(params);
    const router = useRouter();
    const { data: session, isPending: isSessionPending } = authClient.useSession();
    const [state, setState] = useState<PageState>({ kind: "loading" });
    const [isAccepting, setIsAccepting] = useState(false);

    useEffect(() => {
        async function loadInvitation() {
            const res = await fetch(`/api/v1/invitations/${token}`);
            const data = (await res.json()) as { invitation?: InvitationDetails; error?: string };

            if (!res.ok) {
                if (res.status === 404) setState({ kind: "not_found" });
                else if (res.status === 410) {
                    if (data.error?.includes("accepted")) setState({ kind: "already_accepted" });
                    else setState({ kind: "expired" });
                } else setState({ kind: "error", message: data.error ?? "Unknown error" });
                return;
            }

            if (data.invitation) setState({ kind: "ready", invitation: data.invitation });
        }

        loadInvitation();
    }, [token]);

    async function acceptInvitation() {
        if (isAccepting || state.kind !== "ready") return;
        setIsAccepting(true);

        try {
            const res = await fetch(`/api/v1/invitations/${token}`, { method: "POST" });
            const data = (await res.json()) as { success?: boolean; projectId?: string; error?: string };

            if (!res.ok) {
                setState({ kind: "error", message: data.error ?? "Failed to accept invitation" });
                return;
            }

            setState({
                kind: "accepted",
                projectId: data.projectId!,
                projectName: state.invitation.project.name,
            });
        } finally {
            setIsAccepting(false);
        }
    }

    if (isSessionPending || state.kind === "loading") {
        return (
            <div className="flex min-h-screen items-center justify-center bg-background px-4">
                <div className="w-full max-w-sm space-y-4">
                    <Skeleton className="h-8 w-48 mx-auto" />
                    <Skeleton className="h-32 rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4 text-white">
            <div className="w-full max-w-sm">
                <div className="mb-6 text-center">
                    <Link href="/" className="text-2xl font-bold tracking-tight">
                        Upstream
                    </Link>
                </div>

                {state.kind === "not_found" && (
                    <div className="rounded-xl bg-card p-6 ring-1 ring-white/5 text-center space-y-3">
                        <XCircle className="size-10 text-destructive mx-auto" />
                        <p className="text-lg font-semibold">Invitation not found</p>
                        <p className="text-sm text-eventcontent/65">
                            This invitation link is invalid or has already been used.
                        </p>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href="/">Go to Dashboard</Link>
                        </Button>
                    </div>
                )}

                {state.kind === "expired" && (
                    <div className="rounded-xl bg-card p-6 ring-1 ring-white/5 text-center space-y-3">
                        <XCircle className="size-10 text-destructive mx-auto" />
                        <p className="text-lg font-semibold">Invitation expired</p>
                        <p className="text-sm text-eventcontent/65">
                            This invitation has expired. Ask the project owner to send a new one.
                        </p>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href="/">Go to Dashboard</Link>
                        </Button>
                    </div>
                )}

                {state.kind === "already_accepted" && (
                    <div className="rounded-xl bg-card p-6 ring-1 ring-white/5 text-center space-y-3">
                        <CheckCircle className="size-10 text-green-400 mx-auto" />
                        <p className="text-lg font-semibold">Already accepted</p>
                        <p className="text-sm text-eventcontent/65">
                            This invitation has already been used.
                        </p>
                        <Button asChild className="w-full">
                            <Link href="/">Go to Dashboard</Link>
                        </Button>
                    </div>
                )}

                {state.kind === "error" && (
                    <div className="rounded-xl bg-card p-6 ring-1 ring-white/5 text-center space-y-3">
                        <XCircle className="size-10 text-destructive mx-auto" />
                        <p className="text-lg font-semibold">Something went wrong</p>
                        <p className="text-sm text-eventcontent/65">{state.message}</p>
                        <Button asChild variant="secondary" className="w-full">
                            <Link href="/">Go to Dashboard</Link>
                        </Button>
                    </div>
                )}

                {state.kind === "accepted" && (
                    <div className="rounded-xl bg-card p-6 ring-1 ring-white/5 text-center space-y-3">
                        <CheckCircle className="size-10 text-green-400 mx-auto" />
                        <p className="text-lg font-semibold">You&apos;re in!</p>
                        <p className="text-sm text-eventcontent/65">
                            You&apos;ve joined <span className="text-white font-medium">{state.projectName}</span>.
                        </p>
                        <Button
                            className="w-full"
                            onClick={() => router.push(`/projects/${state.kind === "accepted" ? (state as { projectId: string }).projectId : ""}`)}
                        >
                            Open Project
                        </Button>
                    </div>
                )}

                {state.kind === "ready" && (
                    <div className="rounded-xl bg-card p-6 ring-1 ring-white/5 space-y-4">
                        <div className="text-center space-y-1">
                            <p className="text-lg font-semibold">You&apos;ve been invited</p>
                            <p className="text-sm text-eventcontent/65">
                                <span className="text-white font-medium">{state.invitation.invitedBy.name}</span> invited
                                you to join
                            </p>
                        </div>

                        <div className="rounded-lg bg-white/5 px-4 py-3 text-center">
                            <p className="text-xl font-bold text-white">{state.invitation.project.name}</p>
                            <p className="mt-0.5 text-xs text-eventcontent/60 capitalize">
                                as <span className="font-medium">{state.invitation.role.toLowerCase()}</span>
                            </p>
                        </div>

                        {!session ? (
                            <div className="space-y-3">
                                <p className="text-center text-sm text-eventcontent/65">
                                    You need to be logged in to accept this invitation.
                                </p>
                                <Button asChild className="w-full gap-2">
                                    <Link href={`/login?next=/invite/${token}`}>
                                        <LogIn className="size-4" />
                                        Log in to Accept
                                    </Link>
                                </Button>
                                <Button asChild variant="secondary" className="w-full">
                                    <Link href={`/register?next=/invite/${token}`}>
                                        Create an account
                                    </Link>
                                </Button>
                            </div>
                        ) : session.user.email !== state.invitation.email ? (
                            <div className="space-y-3">
                                <div className="rounded-lg bg-yellow-500/10 px-3 py-2 text-xs text-yellow-300">
                                    This invitation was sent to <strong>{state.invitation.email}</strong>, but you&apos;re
                                    logged in as <strong>{session.user.email}</strong>. You can still accept it, but make sure this is the right account.
                                </div>
                                <Button onClick={acceptInvitation} disabled={isAccepting} className="w-full">
                                    {isAccepting ? "Accepting..." : "Accept Invitation"}
                                </Button>
                            </div>
                        ) : (
                            <Button onClick={acceptInvitation} disabled={isAccepting} className="w-full">
                                {isAccepting ? "Accepting..." : "Accept Invitation"}
                            </Button>
                        )}

                        <p className="text-center text-xs text-eventcontent/40">
                            Expires {new Date(state.invitation.expiresAt).toLocaleDateString()}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
