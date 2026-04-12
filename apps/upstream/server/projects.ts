import { NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";

type ProjectRole = "OWNER" | "ADMIN" | "MEMBER";

const MAX_PROJECTS_PER_USER = 3;

export async function getProjectUsageForUser(userId: string) {
    const usedProjects = await db.projectMember.count({
        where: {
            userId,
            role: "OWNER",
        },
    });

    return {
        maxProjects: MAX_PROJECTS_PER_USER,
        usedProjects,
        remainingProjects: Math.max(MAX_PROJECTS_PER_USER - usedProjects, 0),
        canCreateProject: usedProjects < MAX_PROJECTS_PER_USER,
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
