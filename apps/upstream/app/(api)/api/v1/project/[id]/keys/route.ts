import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { generateApiKeySecret, hashApiKeySecret } from "@/server/api-keys";
import { getProjectAdminMembership } from "@/server/projects";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const access = await getProjectAdminMembership(request, id);

    if ("error" in access) {
        return access.error;
    }

    const { session } = access;

    const apiKeys = await db.apiKey.findMany({
        where: {
            projectId: id,
        },
        orderBy: {
            createdAt: "desc",
        },
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            expiresAt: true,
            createdBy: {
                select: {
                    name: true,
                    email: true,
                },
            },
        },
    });

    return NextResponse.json({ apiKeys }, { status: 200 });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const access = await getProjectAdminMembership(request, id);

    if ("error" in access) {
        return access.error;
    }

    const { session } = access;

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = typeof (body as { name?: unknown })?.name === "string"
        ? (body as { name: string }).name.trim()
        : "";

    const descriptionValue = (body as { description?: unknown })?.description;
    const description = typeof descriptionValue === "string" && descriptionValue.trim().length > 0
        ? descriptionValue.trim()
        : null;

    if (!name) {
        return NextResponse.json({ error: "API key name is required" }, { status: 400 });
    }

    if (name.length > 80) {
        return NextResponse.json(
            { error: "API key name must be 80 characters or less" },
            { status: 400 }
        );
    }

    const token = generateApiKeySecret();
    const tokenHash = hashApiKeySecret(token);

    const apiKey = await db.apiKey.create({
        data: {
            projectId: id,
            token: tokenHash,
            name,
            description,
            createdById: session.user.id,
        },
        select: {
            id: true,
            name: true,
            description: true,
            createdAt: true,
            expiresAt: true,
        },
    });

    return NextResponse.json({ apiKey, token }, { status: 201 });
}
