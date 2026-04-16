import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";
import { createProjectAuditLog } from "@/server/project-audit";

// GET — public: return invitation info so the /invite/[token] page can render
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    const invitation = await db.projectInvitation.findUnique({
        where: { token },
        select: {
            id: true,
            email: true,
            role: true,
            expiresAt: true,
            acceptedAt: true,
            project: {
                select: { id: true, name: true },
            },
            invitedBy: {
                select: { name: true, email: true },
            },
        },
    });

    if (!invitation) {
        return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.acceptedAt) {
        return NextResponse.json({ error: "Invitation already accepted" }, { status: 410 });
    }

    if (new Date(invitation.expiresAt) < new Date()) {
        return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
    }

    return NextResponse.json({ invitation }, { status: 200 });
}

// DELETE — decline the invitation (requires session, must match email)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    const session = await auth.api.getSession(request);
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitation = await db.projectInvitation.findUnique({
        where: { token },
        select: { id: true, email: true, acceptedAt: true },
    });

    if (!invitation) {
        return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.email !== session.user.email) {
        return NextResponse.json({ error: "Not your invitation" }, { status: 403 });
    }

    await db.projectInvitation.delete({ where: { token } });

    return NextResponse.json({ success: true }, { status: 200 });
}

// POST — accept the invitation (requires session)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    const session = await auth.api.getSession(request);
    if (!session) {
        return NextResponse.json({ error: "You must be logged in to accept an invitation" }, { status: 401 });
    }

    const invitation = await db.projectInvitation.findUnique({
        where: { token },
        select: {
            id: true,
            email: true,
            role: true,
            projectId: true,
            expiresAt: true,
            acceptedAt: true,
        },
    });

    if (!invitation) {
        return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    if (invitation.acceptedAt) {
        return NextResponse.json({ error: "Invitation already accepted" }, { status: 410 });
    }

    if (new Date(invitation.expiresAt) < new Date()) {
        return NextResponse.json({ error: "Invitation has expired" }, { status: 410 });
    }

    // Check if already a member
    const existing = await db.projectMember.findUnique({
        where: {
            userId_projectId: {
                userId: session.user.id,
                projectId: invitation.projectId,
            },
        },
    });

    if (existing) {
        return NextResponse.json({ error: "You are already a member of this project" }, { status: 409 });
    }

    await db.$transaction([
        db.projectMember.create({
            data: {
                projectId: invitation.projectId,
                userId: session.user.id,
                role: invitation.role,
            },
        }),
        db.projectInvitation.update({
            where: { id: invitation.id },
            data: { acceptedAt: new Date() },
        }),
    ]);

    await createProjectAuditLog({
        projectId: invitation.projectId,
        actorUserId: session.user.id,
        action: "member.invitation_accepted",
        title: "Invitation accepted",
        description: `${session.user.email} accepted the invitation as ${invitation.role}.`,
        metadata: { role: invitation.role },
    });

    return NextResponse.json({ success: true, projectId: invitation.projectId }, { status: 200 });
}
