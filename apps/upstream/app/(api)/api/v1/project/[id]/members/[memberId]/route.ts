import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";

type MemberRole = "OWNER" | "ADMIN" | "MEMBER";

async function getProjectAccess(request: NextRequest, id: string) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
    }

    const membership = await db.projectMember.findFirst({
        where: {
            projectId: id,
            userId: session.user.id,
        },
        select: {
            id: true,
            role: true,
            userId: true,
        },
    });

    if (!membership) {
        return { error: NextResponse.json({ error: "Project not found" }, { status: 404 }) };
    }

    return { session, membership };
}

async function getAdminCount(projectId: string) {
    return db.projectMember.count({
        where: {
            projectId,
            role: {
                in: ["OWNER", "ADMIN"],
            },
        },
    });
}

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    const { id, memberId } = await params;
    const access = await getProjectAccess(request, id);

    if ("error" in access) {
        return access.error;
    }

    const { membership } = access;

    const canManageRoles = membership.role === "OWNER" || membership.role === "ADMIN";

    if (!canManageRoles) {
        return NextResponse.json({ error: "Only owners and admins can change member roles" }, { status: 403 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const role = (body as { role?: unknown })?.role;
    if (role !== "ADMIN" && role !== "MEMBER") {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const target = await db.projectMember.findFirst({
        where: {
            id: memberId,
            projectId: id,
        },
        select: {
            id: true,
            role: true,
            userId: true,
        },
    });

    if (!target) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    if (target.role === "OWNER") {
        return NextResponse.json({ error: "Owner role cannot be changed" }, { status: 400 });
    }

    if (target.role === role) {
        return NextResponse.json({ success: true, member: target }, { status: 200 });
    }

    if (target.role === "ADMIN" && role === "MEMBER") {
        const adminCount = await getAdminCount(id);
        if (adminCount <= 1) {
            return NextResponse.json({ error: "You must keep at least one owner or admin on the project" }, { status: 400 });
        }
    }

    const updated = await db.projectMember.update({
        where: {
            id: target.id,
        },
        data: {
            role: role as MemberRole,
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

    return NextResponse.json({ success: true, member: updated }, { status: 200 });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; memberId: string }> }
) {
    const { id, memberId } = await params;
    const access = await getProjectAccess(request, id);

    if ("error" in access) {
        return access.error;
    }

    const { session, membership } = access;

    const target = await db.projectMember.findFirst({
        where: {
            id: memberId,
            projectId: id,
        },
        select: {
            id: true,
            role: true,
            userId: true,
        },
    });

    if (!target) {
        return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    const isSelf = target.userId === session.user.id;
    const isManagerAction = membership.role === "OWNER" || membership.role === "ADMIN";

    if (!isSelf && !isManagerAction) {
        return NextResponse.json({ error: "Only owners and admins can remove members" }, { status: 403 });
    }

    if (target.role === "OWNER") {
        return NextResponse.json({ error: "Project owner cannot be removed" }, { status: 400 });
    }

    if (target.role === "ADMIN") {
        const adminCount = await getAdminCount(id);
        if (adminCount <= 1) {
            return NextResponse.json({ error: "You must keep at least one owner or admin on the project" }, { status: 400 });
        }
    }

    await db.projectMember.delete({
        where: {
            id: target.id,
        },
    });

    return NextResponse.json(
        { success: true, selfLeft: isSelf },
        { status: 200 }
    );
}
