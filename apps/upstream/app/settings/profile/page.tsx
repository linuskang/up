"use client";

import { authClient } from "@/client/auth";
import Navbar from "@/components/navbar";
import { redirect } from "next/navigation";
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
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
  const { data: session, isPending } = authClient.useSession();

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
        <div className="w-full max-w-2xl p-6 overflow-auto">
          <Breadcrumb className="mb-4">
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/">Dashboard</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
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
            <h1 className="mb-4 text-xl font-semibold text-white">Profile</h1>

            <div className="space-y-3">
              <div>
                <Label htmlFor="display-name" className="mb-1 text-eventcontent/75">Display Name</Label>
                <Input id="display-name" defaultValue={session.user.name || ""} className="bg-background/40 text-white" />
              </div>
              <div>
                <Label htmlFor="email" className="mb-1 text-eventcontent/75">Email</Label>
                <Input id="email" defaultValue={session.user.email || ""} className="bg-background/40 text-white" />
              </div>
              <div>
                <Label htmlFor="image" className="mb-1 text-eventcontent/75">Profile Image URL</Label>
                <Input id="image" defaultValue={session.user.image || ""} className="bg-background/40 text-white" />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button size="sm">Save Profile</Button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
