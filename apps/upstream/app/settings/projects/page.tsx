"use client";

import { authClient } from "@/client/auth";
import { redirect, useRouter } from "next/navigation";
import { Folder, GalleryVerticalEnd, Settings, ArrowUpRightIcon } from "lucide-react";
import Navbar from "@/components/navbar";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@workspace/ui/components/breadcrumb";
import { useEffect, useState } from "react";
import { Project } from "@/types";
import { Button } from "@workspace/ui/components/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@workspace/ui/components/empty";

export default function Page() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    let isCancelled = false;

    async function loadProjects() {
      const response = await fetch("/api/v1/project");

      if (!response.ok) return;

      const data = (await response.json()) as { projects?: Project[] };

      if (!isCancelled) {
        setProjects(data.projects ?? []);
      }
    }

    loadProjects();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isPending) return <div>Loading...</div>;
  if (!session) redirect("/login");

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
        <div className="w-full max-w-2xl p-6 space-y-6">

          {/* Breadcrumb */}
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href="/settings">Settings</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Manage Projects</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {/* Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Projects</h2>

            <Link href="/settings/projects/new-project">
              <Button className="cursor-pointer">Create Project</Button>
            </Link>
          </div>

          {projects.length === 0 ? (
            <div className="rounded-lg bg-card p-6 ring-1 ring-white/5 text-center">
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Folder />
                  </EmptyMedia>
                  <EmptyTitle>No Projects Yet</EmptyTitle>
                  <EmptyDescription>
                    You haven’t created any projects yet. Get started by creating
                    your first project to start tracking events.
                  </EmptyDescription>
                </EmptyHeader>

                <Button
                  variant="link"
                  asChild
                  className="text-muted-foreground"
                  size="sm"
                >
                  <a href="#">
                    Learn More <ArrowUpRightIcon />
                  </a>
                </Button>
              </Empty>
            </div>
          ) : (
            <div className="overflow-hidden rounded-lg bg-card ring-1 ring-white/5">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Project</th>
                    <th className="px-4 py-2 font-semibold">ID</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project) => (
                    <tr
                      key={project.id}
                      onClick={() => router.push(`/settings/projects/${project.id}`)}
                      className="cursor-pointer border-t border-white/5 hover:bg-muted/40 transition"
                    >
                      <td className="px-4 py-3 font-medium">
                        {project.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {project.id}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
