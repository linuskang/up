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
                <BreadcrumbPage>Usage</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          <section className="rounded-xl bg-card p-4 ring-1 ring-white/5">
            <h1 className="mb-4 text-xl font-semibold text-white">Usage</h1>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-background/30 p-3">
                <p className="text-xs text-eventcontent/65">API Calls</p>
                <p className="text-lg font-semibold text-white">0</p>
              </div>
              <div className="rounded-lg bg-background/30 p-3">
                <p className="text-xs text-eventcontent/65">Events</p>
                <p className="text-lg font-semibold text-white">0</p>
              </div>
              <div className="rounded-lg bg-background/30 p-3">
                <p className="text-xs text-eventcontent/65">Storage</p>
                <p className="text-lg font-semibold text-white">0 MB</p>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
