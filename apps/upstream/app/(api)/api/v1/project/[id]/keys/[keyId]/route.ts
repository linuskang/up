import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";
import { createProjectAuditLog } from "@/server/project-audit";

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; keyId: string }> }
) {
    const session = await auth.api.getSession(request);
    const { id, keyId } = await params;

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
        return NextResponse.json({ error: "Only owners and admins can revoke API keys" }, { status: 403 });
    }

    const deleted = await db.apiKey.deleteMany({
        where: {
            id: keyId,
            projectId: id,
        },
    });

    if (!deleted.count) {
        return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await createProjectAuditLog({
        projectId: id,
        actorUserId: session.user.id,
        action: "api_key.revoked",
        title: "API key revoked",
        description: `Revoked API key ${keyId}.`,
        metadata: {
            keyId,
        },
    });

    return NextResponse.json({ success: true }, { status: 200 });
}
