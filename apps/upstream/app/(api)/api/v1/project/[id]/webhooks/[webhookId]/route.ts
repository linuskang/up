import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { getProjectAdminMembership } from "@/server/projects";
import { createProjectAuditLog } from "@/server/project-audit";

export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
    const { id, webhookId } = await params;

    const access = await getProjectAdminMembership(request, id);
    if ("error" in access) return access.error;

    const existing = await db.webhook.findFirst({
        where: { id: webhookId, projectId: id },
    });
    if (!existing) {
        return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const updates: { name?: string; url?: string; enabled?: boolean } = {};

    if (typeof (body as { name?: unknown })?.name === "string") {
        const name = (body as { name: string }).name.trim();
        if (name) updates.name = name;
    }

    if (typeof (body as { url?: unknown })?.url === "string") {
        const url = (body as { url: string }).url.trim();
        try {
            new URL(url);
            updates.url = url;
        } catch {
            return NextResponse.json({ error: "URL must be a valid URL" }, { status: 400 });
        }
    }

    if (typeof (body as { enabled?: unknown })?.enabled === "boolean") {
        updates.enabled = (body as { enabled: boolean }).enabled;
    }

    const webhook = await db.webhook.update({
        where: { id: webhookId },
        data: updates,
        select: { id: true, name: true, url: true, enabled: true, createdAt: true },
    });

    await createProjectAuditLog({
        projectId: id,
        actorUserId: access.session.user.id,
        action: "webhook.updated",
        title: "Webhook updated",
        description: `Webhook "${webhook.name}" was updated.`,
    });

    return NextResponse.json({ webhook }, { status: 200 });
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string; webhookId: string }> }
) {
    const { id, webhookId } = await params;

    const access = await getProjectAdminMembership(request, id);
    if ("error" in access) return access.error;

    const existing = await db.webhook.findFirst({
        where: { id: webhookId, projectId: id },
    });
    if (!existing) {
        return NextResponse.json({ error: "Webhook not found" }, { status: 404 });
    }

    await db.webhook.delete({ where: { id: webhookId } });

    await createProjectAuditLog({
        projectId: id,
        actorUserId: access.session.user.id,
        action: "webhook.deleted",
        title: "Webhook deleted",
        description: `Webhook "${existing.name}" was deleted.`,
    });

    return NextResponse.json({ success: true }, { status: 200 });
}
