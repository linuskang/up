import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { getProjectAdminMembership, getProjectMembership } from "@/server/projects";
import { createProjectAuditLog } from "@/server/project-audit";
import { randomBytes } from "crypto";

function generateWebhookSecret() {
    return `whs_${randomBytes(32).toString("hex")}`;
}

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const access = await getProjectMembership(request, id);
    if ("error" in access) return access.error;

    const webhooks = await db.webhook.findMany({
        where: { projectId: id },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            name: true,
            url: true,
            enabled: true,
            events: true,
            createdAt: true,
        },
    });

    return NextResponse.json({ webhooks }, { status: 200 });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const access = await getProjectAdminMembership(request, id);
    if ("error" in access) return access.error;

    let body: unknown;
    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const name = typeof (body as { name?: unknown })?.name === "string"
        ? (body as { name: string }).name.trim()
        : "";

    const url = typeof (body as { url?: unknown })?.url === "string"
        ? (body as { url: string }).url.trim()
        : "";

    if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });
    if (!url) return NextResponse.json({ error: "URL is required" }, { status: 400 });

    try {
        new URL(url);
    } catch {
        return NextResponse.json({ error: "URL must be a valid HTTPS URL" }, { status: 400 });
    }

    const rawEvents = (body as { events?: unknown })?.events;
    const parsedEvents: string[] = Array.isArray(rawEvents)
        ? rawEvents.filter((e): e is string => typeof e === "string" && e.trim().length > 0).map((e) => e.trim())
        : ["*"];
    const webhookEvents = parsedEvents.length > 0 ? parsedEvents : ["*"];

    const secret = generateWebhookSecret();

    const webhook = await db.webhook.create({
        data: {
            projectId: id,
            name,
            url,
            secret,
            enabled: true,
            events: webhookEvents,
        },
        select: {
            id: true,
            name: true,
            url: true,
            enabled: true,
            events: true,
            createdAt: true,
        },
    });

    await createProjectAuditLog({
        projectId: id,
        actorUserId: access.session.user.id,
        action: "webhook.created",
        title: "Webhook created",
        description: `Webhook "${name}" created for ${url}.`,
    });

    return NextResponse.json({ webhook, secret }, { status: 201 });
}
