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
                                <p className="text-xs text-muted-foreground">Perfect for small projects</p>
                            </div>
                            <Label className="px-2 py-1 bg-muted rounded-md text-muted-foreground">
                                Current Plan
                            </Label>
                        </div>
                        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> 1 project
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> 50 events / day
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> 3 days data retention
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> 1 member
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Community support
                            </li>
                        </ul>
                    </div>

                    <div className="flex flex-col gap-4 rounded-lg bg-muted/40 p-4 mt-3">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-foreground">Pro ($29 / month)*</p>
                                <p className="text-xs text-muted-foreground">Advanced features for production apps</p>
                            </div>
                            <Button variant="default" size="sm">
                                Upgrade
                            </Button>
                        </div>
                        <ul className="flex flex-col gap-2 text-sm text-muted-foreground">
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Unlimited projects
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> 10,000 events / day
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> 90 days data retention
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Analytics
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Bulk event export
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Event webhooks
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Unlimited members
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Project audit logs
                            </li>
                            <li className="flex items-center gap-2">
                                <Check className="h-4 w-4" /> Email support
                            </li>
                        </ul>
                    </div>

                    <p className="mt-4 text-xs text-muted-foreground">
                        * Pro plan perks are currently applied to beta accounts for free whilst we gather feedback for development. This perks will remain free until we enter production!
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}
