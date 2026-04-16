"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart2, List } from "lucide-react";

interface ProjectNavProps {
    projectId: string;
    projectName?: string;
}

export default function ProjectNav({ projectId, projectName }: ProjectNavProps) {
    const pathname = usePathname();

    const tabs = [
        {
            label: "Events",
            href: `/projects/${projectId}`,
            icon: List,
            active: pathname === `/projects/${projectId}`,
        },
        {
            label: "Analytics",
            href: `/projects/${projectId}/analytics`,
            icon: BarChart2,
            active: pathname === `/projects/${projectId}/analytics`,
        },
    ];

    return (
        <div className="flex items-center gap-1 border-b border-white/5 pb-0 mb-4">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                            tab.active
                                ? "border-primary text-white"
                                : "border-transparent text-eventcontent/60 hover:text-white hover:border-white/20"
                        }`}
                    >
                        <Icon className="size-3.5" />
                        {tab.label}
                    </Link>
                );
            })}
        </div>
    );
}
