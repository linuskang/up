"use client";

// Libraries
import { authClient } from "@/client/auth";
import Link from "next/link";

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

export default function Page() {
    const { data: session } = authClient.useSession();

    if (!session) {
        return null;
    }

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
                            <Label className="px-2 py-1 bg-muted rounded-md text-muted-foreground">
                                Current Plan
                            </Label>
                        </div>
                        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 1 project
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 50 events / month
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 7 days event retention
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 1 member
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Community support
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-4 mt-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Pro ($29 / month)¹</p>
                                <p className="text-xs text-muted-foreground">Higher quotas & advanced features for pro users</p>
                            </div>
                            <Button variant="default" size="sm">
                                Upgrade
                            </Button>
                        </div>
                        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 10 projects
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 10,000 events / month²
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 90 days event retention
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Up to 10 project members
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
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> BYO domain
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Email support
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Extra Usage³
                            </li>
                        </ul>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                        ¹ Pro plan perks are available to all beta users for free during the beta period, which will end on July 31, 2026. After the beta period, users will need to upgrade to the Pro plan to continue enjoying these perks.
                    </p>

                    <p className="text-xs text-muted-foreground mt-2">
                        ² Maximum event payload is 512KB. This may change in the future. To increase this limit, please contact support.
                    </p>

                    <p className="text-xs text-muted-foreground mt-2">
                        ³ Extra Usage is available to pro plan subscribers who exceed the included quotas:
                        <ul className="list-disc list-inside mt-1 mb-1">
                            <li>$2.50 per 1,000 events / month</li>
                        </ul>
                        To enable extra usage, please go to <Link href="/settings/billing" className="text-primary underline">Account Billing</Link> and enable Extra usage.
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
