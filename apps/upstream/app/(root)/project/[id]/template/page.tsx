"use client";

import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage, BreadcrumbLink, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Project } from "@/types";
import notFound from "@/app/not-found";

export default function Page() {

    const [project, setProject] = useState(null as Project | null);

    const params = useParams();

    useEffect(() => {
        const fetchProject = async () => {
            const res = await fetch(`/api/project/${params.id}`);
            const data = await res.json();

            if (!res.ok) {
                return;
            }

            setProject(data.project);

            if (!project) {
                return (
                    notFound()
                )
            }
        };

        fetchProject();

    }, [params.id]);

    return (
        <main>
            <div className="flex min-h-svh flex-col gap-3 py-6">
                <div className="flex flex-col gap-3">
                    <Breadcrumb>
                        <BreadcrumbList className="text-sm">
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Projects</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>{project?.name}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                </div>
            </div>
        </main>
    )
}