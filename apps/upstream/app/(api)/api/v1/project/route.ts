import db from "@/server/prisma";
import { auth } from "@/server/auth";
import { getProjectUsageForUser, normalizeProjectName } from "@/server/projects";
import { createProjectAuditLog } from "@/server/project-audit";

import { NextRequest, NextResponse } from "next/server";

type ProjectTransactionClient = Pick<typeof db, "project" | "projectMember">;

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projects = await db.project.findMany({
        where: {
            members: {
                some: {
                    userId: session.user.id,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            name: true,
            createdAt: true,
            updatedAt: true,
            members: {
                select: {
                    id: true,
                    role: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            image: true,
                        },
                    },
                },
            },
        },
    });

    const usage = await getProjectUsageForUser(session.user.id);

    return NextResponse.json(
        {
            projects,
            limits: usage,
        },
        { status: 200 }
    );
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = normalizeProjectName((body as { name?: unknown })?.name);

    if (!name) {
        return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    if (name.length > 80) {
        return NextResponse.json(
            { error: "Project name must be 80 characters or less" },
            { status: 400 }
        );
    }

    const usage = await getProjectUsageForUser(session.user.id);

    if (!usage.canCreateProject) {
        return NextResponse.json(
            {
                error: `Project limit reached (${usage.usedProjects}/${usage.maxProjects}).`,
                limits: usage,
            },
            { status: 403 }
        );
    }

    const project = await db.$transaction(async (tx: ProjectTransactionClient) => {
        const created = await tx.project.create({
            data: {
                name,
            },
            select: {
                id: true,
                name: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        await tx.projectMember.create({
            data: {
                projectId: created.id,
                userId: session.user.id,
                role: "OWNER",
            },
        });

        return created;
    });

    await createProjectAuditLog({
        projectId: project.id,
        actorUserId: session.user.id,
        action: "project.created",
        title: "Project created",
        description: `Created project ${project.name}.`,
    });

    return NextResponse.json({ success: true, project }, { status: 201 });
}
