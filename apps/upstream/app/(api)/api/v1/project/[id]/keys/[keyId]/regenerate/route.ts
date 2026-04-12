import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { generateApiKeySecret, hashApiKeySecret } from "@/server/api-keys";
import { getProjectAdminMembership } from "@/server/projects";
import { createProjectAuditLog } from "@/server/project-audit";

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; keyId: string }> }
) {
    const { id, keyId } = await params;

    const access = await getProjectAdminMembership(request, id);

    if ("error" in access) {
        return access.error;
    }

    const { session } = access;

    const token = generateApiKeySecret();
    const tokenHash = hashApiKeySecret(token);

    const updated = await db.apiKey.updateMany({
        where: {
            id: keyId,
            projectId: id,
        },
        data: {
            token: tokenHash,
        },
    });

    if (!updated.count) {
        return NextResponse.json({ error: "API key not found" }, { status: 404 });
    }

    await createProjectAuditLog({
        projectId: id,
        actorUserId: session.user.id,
        action: "api_key.regenerated",
        title: "API key regenerated",
        description: `Regenerated API key ${keyId}.`,
        metadata: {
            keyId,
        },
    });

    return NextResponse.json({ keyId, token }, { status: 200 });
}
