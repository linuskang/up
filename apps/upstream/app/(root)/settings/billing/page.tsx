"use client";

// Libraries
import { authClient } from "@/client/auth";
import Link from "next/link";
import { useEffect, useState } from "react";

// Components
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from "@/components/ui/card";
import { Check } from "lucide-react";
import type { UsageStats } from "@/types";

export default function Page() {
    const { data: session } = authClient.useSession();
    const [usage, setUsage] = useState<UsageStats | null>(null);

    useEffect(() => {
        fetch("/api/usage")
            .then((r) => r.json())
            .then((data) => setUsage(data))
            .catch(() => {});
    }, []);

    if (!session) {
        return null;
    }

    const currentPlan = (usage?.plan ?? "Free").toLowerCase();

    return (
        <div className="flex min-h-svh flex-col gap-8 py-6">
            <div className="flex flex-col gap-1">
                <Breadcrumb>
                    <BreadcrumbList className="text-sm">
                        <BreadcrumbItem>
                            <BreadcrumbLink asChild>
                                <Link href="/settings">Settings</Link>
                            </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Billing</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <Card className="bg-background p-0 ring-0">
                <CardHeader className="px-0">
                    <CardTitle className="text-2xl font-semibold text-white">Billing Plan</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Free</p>
                                <p className="text-xs text-muted-foreground">Perfect for small projects to log critical events</p>
                            </div>
                            {currentPlan === "free" && (
                                <Label className="px-2 py-1 bg-muted rounded-md text-muted-foreground">
                                    Current Plan
                                </Label>
                            )}
                        </div>
                        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> 1 project
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> 100 events / month
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> 7 days event retention
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Analytics
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Event exporting
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Webhooks
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Audit logs
                            </li>
                        </ul>
                        {currentPlan === "free" && usage && (
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>Projects: {usage.projects.current} / {usage.projects.limit}</p>
                                <p>Events this month: {usage.eventsMonth.current} / {usage.eventsMonth.limit}</p>
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-4 mt-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Pro</p>
                                <p className="text-xs text-muted-foreground">Higher quotas & advanced features for pro users</p>
                            </div>
                            {currentPlan === "pro" ? (
                                <Label className="px-2 py-1 bg-muted rounded-md text-muted-foreground">
                                    Current Plan
                                </Label>
                            ) : (
                                <Button variant="default" size="sm">
                                    <Link href="mailto:up@linus.my">Contact Sales</Link>
                                </Button>
                            )}
                        </div>
                        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Everything in Free, plus:
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 100 projects
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 100,000 events / month
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 90 days event retention
                            </li>
                        </ul>
                        {currentPlan === "pro" && usage && (
                            <div className="text-xs text-muted-foreground space-y-1">
                                <p>Projects: {usage.projects.current} / {usage.projects.limit}</p>
                                <p>Events this month: {usage.eventsMonth.current} / {usage.eventsMonth.limit}</p>
                            </div>
                        )}
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                        Pro plan perks are available to all beta users for free during the beta period, which will end on July 31, 2026. After the beta period, users will need to upgrade to the Pro plan to continue enjoying these perks.
                    </p>

                    <div className="text-xs text-muted-foreground mt-2">
                        Extra Usage is available to pro plan subscribers who exceed the included quotas:
                        <ul className="list-disc list-inside mt-1 mb-1">
                            <li>$2.50 per 1,000 events / month</li>
                        </ul>
                        To enable extra usage, please go to <Link href="/settings/billing" className="text-primary underline">Account Billing</Link> and enable Extra usage.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
