'use client';

import { Folder, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { authClient } from "@/client/auth"

export default function Page() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <div className="flex min-h-svh items-center justify-center py-6">
                <div className="text-sm text-muted-foreground">Loading...</div>
            </div>
        );
    }

    return (
        <div className="flex min-h-svh flex-col gap-8 py-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold">
                    Welcome, {session?.user.name}
                </h1>
                <p className="text-sm text-muted-foreground">
                    Here is an overview of your projects and usage.
                </p>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-foreground">Account Statistics</h2>
                <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg bg-muted/40 p-4">
                        <p className="text-xs text-muted-foreground">Total Projects</p>
                        <p className="text-2xl font-bold text-foreground">0</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-4">
                        <p className="text-xs text-muted-foreground">Events Today</p>
                        <p className="text-2xl font-bold text-foreground">0</p>
                    </div>
                    <div className="rounded-lg bg-muted/40 p-4">
                        <p className="text-xs text-muted-foreground">Account Plan</p>
                        <p className="text-2xl font-bold text-foreground">Pro</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-foreground">Your Projects</h2>
                    <Button className="text-xs cursor-pointer font-bold bg-primary text-primary-foreground hover:bg-primary/80">
                        Create Project
                    </Button>
                </div>

                <div className="flex min-h-[280px] flex-col items-center justify-center gap-4 rounded-lg bg-muted/40 p-8 text-center">
                    <div className="flex size-10 items-center justify-center rounded-lg bg-muted">
                        <Folder className="size-5 text-muted-foreground" fill="currentColor" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-semibold text-foreground">No Projects Yet</p>
                        <p className="max-w-sm text-xs text-muted-foreground">
                            You haven't created any projects yet. Get started by creating your first project to start tracking events.
                        </p>
                    </div>
                    <a
                        href="#"
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Learn More
                        <ArrowUpRight className="size-3" />
                    </a>
                </div>
            </div>

            <div className="flex flex-col gap-3">
                <h2 className="text-sm font-semibold text-foreground">Recent Activity</h2>
                <div className="rounded-lg bg-muted/40 p-4">
                    <p className="text-xs text-muted-foreground">No recent activity</p>
                </div>
            </div>
        </div>
    )
}
