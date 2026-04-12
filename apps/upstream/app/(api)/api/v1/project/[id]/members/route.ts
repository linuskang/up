import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth.api.getSession(request);
    const { id } = await params;

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminMembership = await db.projectMember.findFirst({
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

    if (!adminMembership) {
        return NextResponse.json({ error: "Only owners and admins can invite members" }, { status: 403 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const email = typeof (body as { email?: unknown })?.email === "string"
        ? (body as { email: string }).email.trim().toLowerCase()
        : "";

    const role = (body as { role?: unknown })?.role === "ADMIN" ? "ADMIN" : "MEMBER";

    if (!email) {
        return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const user = await db.user.findUnique({
        where: { email },
        select: {
            id: true,
            name: true,
            email: true,
            image: true,
        },
    });

    if (!user) {
        return NextResponse.json(
            { error: "No account found for that email. The person needs to sign up first." },
            { status: 404 }
        );
    }

    const project = await db.project.findFirst({
        where: {
            id,
            members: {
                some: {
                    userId: session.user.id,
                },
            },
        },
        select: {
            id: true,
            name: true,
        },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const existingMembership = await db.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId: user.id,
                projectId: id,
            },
        },
        select: {
            id: true,
            role: true,
        },
    });

    const membership = existingMembership
        ? await db.projectMember.update({
            where: {
                userId_projectId: {
                    userId: user.id,
                    projectId: id,
                },
            },
            data: {
                role,
            },
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
        })
        : await db.projectMember.create({
            data: {
                projectId: id,
                userId: user.id,
                role,
            },
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
        });

    return NextResponse.json(
        {
            success: true,
            project,
            member: membership,
        },
        { status: existingMembership ? 200 : 201 }
    );
}
