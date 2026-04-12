import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";

export async function GET(
    request: NextRequest,
     { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);

    const { id } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        },
    });

    return NextResponse.json({ project }, { status: 200 });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    const { id } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const membership = await db.projectMember.findFirst({
        where: {
            projectId: id,
            userId: session.user.id,
            role: {
                in: ["OWNER", "ADMIN"],
            },
        },
        select: {
            id: true,
        },
    });

    if (!membership) {
        return NextResponse.json({ error: "Only owners and admins can delete projects" }, { status: 403 });
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
