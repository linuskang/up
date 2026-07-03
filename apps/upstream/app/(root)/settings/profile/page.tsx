"use client";

// Libraries
import { authClient } from "@/client/auth";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import Image from "next/image";

// Components
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
    CardFooter,
} from "@/components/ui/card";

interface ProfileFormProps {
    user: {
        name: string;
        email: string;
        image?: string | null | undefined;
    };
}

function ProfileForm({ user }: ProfileFormProps) {
    const [name, setName] = useState(user.name || "");
    const [image, setImage] = useState(user.image || "");
    const [email] = useState(user.email || "");
    const [isSaving, setIsSaving] = useState(false);

    const update = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);

        const { error } = await authClient.updateUser({
            name,
            image,
        });

        if (error) {
            toast.error("Failed to update profile.");
            setIsSaving(false);
            return;
        }

        toast.success("Profile updated successfully.");
        setIsSaving(false);
    };

    return (
        <Card className="bg-card ring-0">
            <CardHeader>
                <CardTitle className="text-2xl font-semibold text-white">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
                <form id="profile-form" onSubmit={update} className="space-y-3">
                    <div>
                        <Label htmlFor="display-name" className="mb-2">
                            Display Name
                        </Label>
                        <Input
                            id="display-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="bg-input border-0 text-white"
                        />
                    </div>

                    <div>
                        <Label htmlFor="image" className="mb-2">
                            Profile Image
                        </Label>

                        {image && (
                            <div className="mt-2 mb-2 flex items-center gap-2">
                                <div className="relative size-12 overflow-hidden rounded-md border border-border/60 bg-secondary">
                                    <Image
                                        key={image}
                                        src={image}
                                        alt="Avatar preview"
                                        fill
                                        unoptimized
                                        className="object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = "none";
                                        }}
                                    />
                                </div>
                                <span className="text-xs text-muted-foreground">Preview</span>
                            </div>
                        )}

                        <Input
                            id="image"
                            value={image}
                            onChange={(e) => setImage(e.target.value)}
                            className="bg-input border-0 text-white"
                        />
                    </div>

                    <div>
                        <Label htmlFor="email" className="mb-2">
                            Email
                        </Label>
                        <Input
                            id="email"
                            value={email}
                            className="bg-input border-0 text-white"
                            disabled
                        />
                    </div>
                </form>
            </CardContent>
            <CardFooter className="justify-end">
                <Button size="sm" type="submit" form="profile-form" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </CardFooter>
        </Card>
    );
}

export default function Page() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
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
                                <BreadcrumbPage>Profile</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
                <Card className="bg-card ring-0">
                    <CardHeader>
                        <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="h-10 w-full animate-pulse rounded bg-muted" />
                        <div className="h-10 w-full animate-pulse rounded bg-muted" />
                        <div className="h-10 w-full animate-pulse rounded bg-muted" />
                    </CardContent>
                    <CardFooter className="justify-end">
                        <div className="h-9 w-28 animate-pulse rounded bg-muted" />
                    </CardFooter>
                </Card>
            </div>
        );
    }

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
                            <BreadcrumbPage>Profile</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
            </div>

            <ProfileForm user={session.user} />
        </div>
    );
}
