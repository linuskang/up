"use client";

import { authClient } from "@/client/auth";
import { redirect, useRouter } from "next/navigation";
import { Folder, ArrowUpRightIcon, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import Navbar from "@/components/navbar";
import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import type { Project } from "@/types";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

type ProjectLimits = {
  maxProjects: number;
  usedProjects: number;
  remainingProjects: number;
  canCreateProject: boolean;
};

export default function Page() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [projects, setProjects] = useState<Project[]>([]);
  const [limits, setLimits] = useState<ProjectLimits | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadProjects() {
      const response = await fetch("/api/v1/project");

      if (!response.ok) return;

      const data = (await response.json()) as { projects?: Project[]; limits?: ProjectLimits };

      if (!isCancelled) {
        setProjects(data.projects ?? []);
        setLimits(data.limits ?? null);
      }
    }

    loadProjects();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isPending) {
    return (
      <div className="flex min-h-screen flex-col bg-background text-white">
        <Navbar user={{}} />
        <main className="flex-1 flex justify-center">
          <div className="w-full max-w-2xl p-6 space-y-4">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-9 w-36" />
            <Skeleton className="h-40 rounded-lg" />
          </div>
        </main>
      </div>
    );
  }
  if (!session) redirect("/login");

  const canCreateProject = limits?.canCreateProject ?? true;

  function getMyRole(project: Project) {
    return project.members.find((member) => member.user.id === session?.user.id)?.role;
  }

  const ownedProjects = projects.filter((project) => getMyRole(project) === "OWNER");
  const invitedProjects = projects.filter((project) => {
    const role = getMyRole(project);
    return role === "ADMIN" || role === "MEMBER";
  });

  function getOwner(project: Project) {
    return project.members.find((member) => member.role === "OWNER");
  }

  function renderOwnerCell(project: Project) {
    const owner = getOwner(project);

    if (!owner) {
      return <span className="text-muted-foreground">Unknown owner</span>;
    }

    return (
      <div className="flex items-center gap-3">
        <Avatar className="size-8 rounded-md">
          <AvatarImage src={owner.user.image ?? undefined} alt={owner.user.name} />
          <AvatarFallback className="rounded-md text-xs">
            {owner.user.name?.charAt(0).toUpperCase() || owner.user.email.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="truncate font-medium">{owner.user.name}</div>
          <div className="truncate text-xs text-muted-foreground">{owner.user.email}</div>
        </div>
      </div>
    );
  }

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
        <div className="w-full max-w-2xl p-6 space-y-6">
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

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Projects</h2>

            <Link href="/settings/projects/new-project">
              <Button className="cursor-pointer" disabled={!canCreateProject}>Create Project</Button>
            </Link>
          </div>

          {limits && <p className="text-xs text-eventcontent/65">Projects used: {limits.usedProjects}/{limits.maxProjects}</p>}

          {!canCreateProject && (
            <p className="text-xs text-red-300">Project limit reached.</p>
          )}

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
            <div className="space-y-6">
              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-eventcontent/65">
                  Owned Projects
                </h3>
                {ownedProjects.length === 0 ? (
                  <p className="rounded-lg bg-card p-3 text-xs text-eventcontent/70 ring-1 ring-white/5">
                    You do not own any projects yet.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-lg bg-card ring-1 ring-white/5">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Project</th>
                          <th className="px-4 py-2 font-semibold">Owner</th>
                          <th className="px-4 py-2 font-semibold">ID</th>
                        </tr>
                      </thead>

                      <tbody>
                        {ownedProjects.map((project) => (
                          <tr
                            key={project.id}
                            onClick={() => router.push(`/settings/projects/${project.id}`)}
                            className="cursor-pointer border-t border-white/5 transition hover:bg-muted/40"
                          >
                            <td className="px-4 py-3 font-medium">{project.name}</td>
                            <td className="px-4 py-3">{renderOwnerCell(project)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{project.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>

              <section>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-eventcontent/65">
                  Invited Projects
                </h3>
                {invitedProjects.length === 0 ? (
                  <p className="rounded-lg bg-card p-3 text-xs text-eventcontent/70 ring-1 ring-white/5">
                    You are not an admin or member in any invited projects.
                  </p>
                ) : (
                  <div className="overflow-hidden rounded-lg bg-card ring-1 ring-white/5">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50 text-left">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Project</th>
                          <th className="px-4 py-2 font-semibold">Owner</th>
                          <th className="px-4 py-2 font-semibold">ID</th>
                        </tr>
                      </thead>

                      <tbody>
                        {invitedProjects.map((project) => (
                          <tr
                            key={project.id}
                            onClick={() => router.push(`/settings/projects/${project.id}`)}
                            className="cursor-pointer border-t border-white/5 transition hover:bg-muted/40"
                          >
                            <td className="px-4 py-3 font-medium">{project.name}</td>
                            <td className="px-4 py-3">{renderOwnerCell(project)}</td>
                            <td className="px-4 py-3 text-muted-foreground">{project.id}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </section>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
