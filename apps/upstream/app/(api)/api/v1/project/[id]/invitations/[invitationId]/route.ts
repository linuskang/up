import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { getProjectAdminMembership } from "@/server/projects";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; invitationId: string }> }
) {
    const { id, invitationId } = await params;

    const access = await getProjectAdminMembership(request, id);
    if ("error" in access) return access.error;

    const invitation = await db.projectInvitation.findFirst({
        where: { id: invitationId, projectId: id },
    });

    if (!invitation) {
        return NextResponse.json({ error: "Invitation not found" }, { status: 404 });
    }

    await db.projectInvitation.delete({ where: { id: invitationId } });

    return NextResponse.json({ success: true }, { status: 200 });
}
