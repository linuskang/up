import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";
import { generateApiKeySecret, hashApiKeySecret } from "@/lib/api-keys";

export async function POST(
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
        return NextResponse.json({ error: "Only owners and admins can regenerate API keys" }, { status: 403 });
    }

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

    return NextResponse.json({ keyId, token }, { status: 200 });
}
