import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { getProjectAdminMembership } from "@/server/projects";
import { createProjectAuditLog } from "@/server/project-audit";
import { sendProjectInviteEmail } from "@/server/email";
import { env } from "@/env";
import { randomBytes } from "crypto";
import { addDays } from "date-fns";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const access = await getProjectAdminMembership(request, id);
    if ("error" in access) return access.error;

    const { session } = access;

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

    const project = await db.project.findFirst({
        where: { id },
        select: { id: true, name: true },
    });

    if (!project) {
        return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    // If the user is already a member, just update their role
    const targetUser = await db.user.findUnique({
        where: { email },
        select: { id: true },
    });

    if (targetUser) {
        const existingMembership = await db.projectMember.findUnique({
            where: { userId_projectId: { userId: targetUser.id, projectId: id } },
        });

        if (existingMembership) {
            const updated = await db.projectMember.update({
                where: { userId_projectId: { userId: targetUser.id, projectId: id } },
                data: { role },
                select: {
                    id: true, role: true,
                    user: { select: { id: true, name: true, email: true, image: true } },
                },
            });

            await createProjectAuditLog({
                projectId: id,
                actorUserId: session.user.id,
                action: "member.role_updated",
                title: "Member role updated",
                description: `${email} role updated to ${role}.`,
                metadata: { memberEmail: email, role },
            });

            return NextResponse.json({ success: true, project, member: updated }, { status: 200 });
        }
    }

    // Not already a member — cancel any existing pending invitation for this email+project
    await db.projectInvitation.deleteMany({
        where: { projectId: id, email, acceptedAt: null },
    });

    const token = randomBytes(32).toString("hex");
    const expiresAt = addDays(new Date(), 7);

    const invitation = await db.projectInvitation.create({
        data: {
            projectId: id,
            email,
            role,
            token,
            invitedById: session.user.id,
            expiresAt,
        },
        select: { id: true, email: true, role: true, expiresAt: true },
    });

    const inviteUrl = `${env.BETTER_AUTH_URL}/invite/${token}`;

    await sendProjectInviteEmail({
        to: email,
        inviterName: session.user.name,
        projectName: project.name,
        role,
        inviteUrl,
    });

    await createProjectAuditLog({
        projectId: id,
        actorUserId: session.user.id,
        action: "member.invited",
        title: "Member invited",
        description: `Invitation sent to ${email} as ${role}.`,
        metadata: { memberEmail: email, role },
    });

    return NextResponse.json({ success: true, invited: true, invitation }, { status: 201 });
}
