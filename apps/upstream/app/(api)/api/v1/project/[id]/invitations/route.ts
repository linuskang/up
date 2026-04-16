import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { getProjectAdminMembership } from "@/server/projects";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const access = await getProjectAdminMembership(request, id);
    if ("error" in access) return access.error;

    const invitations = await db.projectInvitation.findMany({
        where: {
            projectId: id,
            acceptedAt: null,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            email: true,
            role: true,
            createdAt: true,
            expiresAt: true,
        },
    });

    return NextResponse.json({ invitations }, { status: 200 });
}
