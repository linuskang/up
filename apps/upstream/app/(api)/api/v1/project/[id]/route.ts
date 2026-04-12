import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { getProjectAdminMembership, getProjectMembership, normalizeProjectName } from "@/server/projects";
import { createProjectAuditLog } from "@/server/project-audit";

export async function GET(
    request: NextRequest,
     { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const access = await getProjectMembership(request, id);

    if ("error" in access) {
        return access.error;
    }

    const { session } = access;

    const project = await db.project.findFirst({
        where: {
            members: {
                some: {
                    userId: session.user.id,
                },
            },
            id: id,
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
                orderBy: {
                    createdAt: "asc",
                },
            },
            auditLogs: {
                take: 20,
                orderBy: {
                    createdAt: "desc",
                },
                select: {
                    id: true,
                    action: true,
                    title: true,
                    description: true,
                    metadata: true,
                    createdAt: true,
                    actor: {
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

    return NextResponse.json({ project }, { status: 200 });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const access = await getProjectAdminMembership(request, id);

    if ("error" in access) {
        return access.error;
    }

    const deleted = await db.project.deleteMany({
        where: {
            id,
        },
    });

    if (!deleted.count) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const access = await getProjectAdminMembership(request, id);

    if ("error" in access) {
        return access.error;
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
        return NextResponse.json({ error: "Project name must be 80 characters or less" }, { status: 400 });
    }

    const project = await db.project.update({
        where: {
            id,
        },
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

    await createProjectAuditLog({
        projectId: id,
        actorUserId: access.session.user.id,
        action: "project.renamed",
        title: "Project renamed",
        description: `Renamed project to ${project.name}.`,
        metadata: {
            name: project.name,
        },
    });

    return NextResponse.json({ success: true, project }, { status: 200 });
}
