import db from "@/server/prisma";
import { auth } from "@/server/auth";

import { NextRequest, NextResponse } from "next/server";

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
            members: true,
        },
    });

    return NextResponse.json({ projects }, { status: 200 });
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

    const name = typeof (body as { name?: unknown })?.name === "string"
        ? (body as { name: string }).name.trim()
        : "";

    if (!name) {
        return NextResponse.json({ error: "Project name is required" }, { status: 400 });
    }

    if (name.length > 80) {
        return NextResponse.json(
            { error: "Project name must be 80 characters or less" },
            { status: 400 }
        );
    }

    const project = await db.$transaction(async (tx) => {
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

    return NextResponse.json({ success: true, project }, { status: 201 });
}
