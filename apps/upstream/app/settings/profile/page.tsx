"use client";

import { authClient } from "@/client/auth";
import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";
import { useState } from "react";
import { useEffect } from "react";
import { toast } from "sonner"

export default function Page() {
    const { data: session, isPending } = authClient.useSession();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [image, setImage] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (session) {
            setName(session.user.name || "");
            setEmail(session.user.email || "");
            setImage(session.user.image || "");
        }
    }, [session]);

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        setIsSaving(true);
        try {
            await fetch("/api/v1/account", {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name, email, image }),
            });

            toast("Profile updated successfully");
        } catch (err) {
            toast.error("Failed to update profile");
        } finally {
            setIsSaving(false);
        }
    };

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
                <div className="w-full max-w-2xl p-6 overflow-auto">
                    <Breadcrumb className="mb-4">
                        <BreadcrumbList>
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
                    <section className="rounded-xl bg-card p-4 ring-1 ring-white/5">
                        <h2 className="mb-4 text-2xl font-semibold text-white">Your Profile</h2>
                        <form onSubmit={handleSave} className="space-y-3">
                            <div>
                                <Label htmlFor="display-name" className="mb-1 text-eventcontent/75">
                                    Display Name
                                </Label>
                                <Input
                                    id="display-name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="bg-background/40 text-white"
                                />
                            </div>

                            <div>
                                <Label htmlFor="email" className="mb-1 text-eventcontent/75">
                                    Email
                                </Label>
                                <Input
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="bg-background/40 text-white"
                                />
                            </div>

                            <div>
                                <Label htmlFor="image" className="mb-1 text-eventcontent/75">
                                    Profile Image URL
                                </Label>
                                <Input
                                    id="image"
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="bg-background/40 text-white"
                                />
                            </div>

                            <div className="mt-4 flex justify-end">
                                <Button size="sm" type="submit" disabled={isSaving}>
                                    {isSaving ? "Saving..." : "Save Profile"}
                                </Button>
                            </div>
                        </form>
                    </section>
                </div>
            </main>
        </div>
    );
}
