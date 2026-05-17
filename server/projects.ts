import { NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";

type ProjectRole = "OWNER" | "ADMIN" | "MEMBER";

const DEFAULT_MAX_PROJECTS = 3;

function readMaxProjectsFromConfig(value: unknown) {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return null;
    }

    const maxProjects = (value as { max_projects?: unknown }).max_projects;

    if (typeof maxProjects !== "number" || !Number.isFinite(maxProjects)) {
        return null;
    }

    const normalized = Math.floor(maxProjects);
    return normalized > 0 ? normalized : null;
}

export async function getProjectUsageForUser(userId: string) {
    const user = await db.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            accountPlan: true,
        },
    });

    const configKey = user?.accountPlan === "Pro" ? "pro_plan" : "free_plan";

    const planConfig = await db.config.findUnique({
        where: {
            key: configKey,
        },
        select: {
            value: true,
        },
    });

    const maxProjects = readMaxProjectsFromConfig(planConfig?.value) ?? DEFAULT_MAX_PROJECTS;

    const usedProjects = await db.projectMember.count({
        where: {
            userId,
            role: "OWNER",
        },
    });

    return {
        maxProjects,
        usedProjects,
        remainingProjects: Math.max(maxProjects - usedProjects, 0),
        canCreateProject: usedProjects < maxProjects,
    };
}

export async function getAuthenticatedSession(request: Request) {
    return auth.api.getSession(request);
}

export function normalizeProjectName(name: unknown) {
    return typeof name === "string" ? name.trim() : "";
}

export async function getProjectMembership(
    request: Request,
    projectId: string,
    allowedRoles?: ProjectRole[]
) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const membership = await db.projectMember.findFirst({
        where: {
            projectId,
            userId: session.user.id,
            ...(allowedRoles
                ? { role: { in: allowedRoles } }
                : {}),
        },
        select: {
            id: true,
            role: true,
            userId: true,
        },
    });

    if (!membership) {
        return {
            error: NextResponse.json({ error: "Project not found" }, { status: 404 }),
        };
    }

    return { session, membership };
}

export async function getProjectAdminMembership(request: Request, projectId: string) {
    return getProjectMembership(request, projectId, ["OWNER", "ADMIN"]);
}
