import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";
import { hashApiKeySecret, readApiKeyFromRequest } from "@/server/api-keys";
import { createHmac } from "crypto";

async function fireWebhooks(projectId: string, event: Record<string, unknown>) {
    const category = typeof event.category === "string" ? event.category : null;

    const allWebhooks = await db.webhook.findMany({
        where: { projectId, enabled: true },
        select: { url: true, secret: true, events: true },
    });

    // Keep only webhooks subscribed to this event's category
    const webhooks = allWebhooks.filter((wh: (typeof allWebhooks)[number]) => {
        if (wh.events.includes("*")) return true;
        if (category && wh.events.includes(category)) return true;
        return false;
    });

    if (webhooks.length === 0) return;

    const payload = JSON.stringify({ event });
    const timestamp = Math.floor(Date.now() / 1000).toString();

    await Promise.allSettled(
        webhooks.map(async (wh: (typeof webhooks)[number]) => {
            const signature = createHmac("sha256", wh.secret)
                .update(`${timestamp}.${payload}`)
                .digest("hex");

            try {
                await fetch(wh.url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-Upstream-Timestamp": timestamp,
                        "X-Upstream-Signature": `sha256=${signature}`,
                    },
                    body: payload,
                    signal: AbortSignal.timeout(10_000),
                });
            } catch {
                // Swallow — webhook delivery is best-effort
            }
        })
    );
}

type EventField = {
    name: string;
    value: string;
};

type EventStep = {
    icon: string;
    time: string;
    content: string;
};

type EventAction = {
    label: string;
    type: "primary" | "secondary";
    url: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function normalizeFields(value: unknown): EventField[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    const fields = value
        .filter(isRecord)
        .map((item) => {
            const name = typeof item.name === "string" ? item.name : "";
            const fieldValue = typeof item.value === "string" ? item.value : "";

            if (!name || !fieldValue) {
                return null;
            }

            return { name, value: fieldValue };
        })
        .filter((item): item is EventField => Boolean(item));

    return fields.length > 0 ? fields : null;
}

function normalizeSteps(value: unknown): EventStep[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    const steps = value
        .filter(isRecord)
        .map((item) => {
            const icon = typeof item.icon === "string" ? item.icon : "";
            const time = typeof item.time === "string" ? item.time : "";
            const content = typeof item.content === "string" ? item.content : "";

            if (!icon || !time || !content) {
                return null;
            }

            return { icon, time, content };
        })
        .filter((item): item is EventStep => Boolean(item));

    return steps.length > 0 ? steps : null;
}

function normalizeActions(value: unknown): EventAction[] | null {
    if (!Array.isArray(value)) {
        return null;
    }

    const actions = value
        .filter(isRecord)
        .map((item) => {
            const label = typeof item.label === "string" ? item.label : "";
            const type = item.type === "secondary" ? "secondary" : "primary";
            const url = typeof item.url === "string" ? item.url : "#";

            if (!label) {
                return null;
            }

            return { label, type, url };
        })
        .filter((item): item is EventAction => Boolean(item));

    return actions.length > 0 ? actions : null;
}

async function resolveProjectIdFromApiKey(request: NextRequest) {
    const apiKeySecret = readApiKeyFromRequest(request);

    if (!apiKeySecret) {
        return null;
    }

    const key = await db.apiKey.findFirst({
        where: {
            token: hashApiKeySecret(apiKeySecret),
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } },
            ],
        },
        select: {
            id: true,
            projectId: true,
        },
    });

    return key;
}

export async function GET(request: NextRequest) {
    const key = await resolveProjectIdFromApiKey(request);
    const url = new URL(request.url);
    const limitParam = Number(url.searchParams.get("limit") || "50");
    const category = url.searchParams.get("category")?.trim() || undefined;
    const search = url.searchParams.get("search")?.trim() || undefined;
    const take = Number.isFinite(limitParam) ? Math.min(Math.max(limitParam, 1), 100) : 50;

    let projectId = key?.projectId || "";

    if (!projectId) {
        const session = await auth.api.getSession(request);

        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const queryProjectId = url.searchParams.get("projectId")?.trim() || "";

        if (!queryProjectId) {
            return NextResponse.json({ error: "projectId is required" }, { status: 400 });
        }

        const membership = await db.projectMember.findFirst({
            where: {
                projectId: queryProjectId,
                userId: session.user.id,
            },
            select: {
                id: true,
            },
        });

        if (!membership) {
            return NextResponse.json({ error: "Project not found" }, { status: 404 });
        }

        projectId = queryProjectId;
    }

    const events = await db.event.findMany({
        where: {
            projectId,
            ...(category ? { category } : {}),
            ...(search
                ? {
                    OR: [
                        { title: { contains: search, mode: "insensitive" } },
                        { content: { contains: search, mode: "insensitive" } },
                    ],
                }
                : {}),
        },
        orderBy: {
            createdAt: "desc",
        },
        take,
        select: {
            id: true,
            title: true,
            icon: true,
            time: true,
            content: true,
            category: true,
            fields: true,
            events: true,
            data: true,
            actions: true,
            apiKeyId: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    return NextResponse.json({ events }, { status: 200 });
}

export async function POST(request: NextRequest) {
    const key = await resolveProjectIdFromApiKey(request);

    if (!key) {
        return NextResponse.json({ error: "A valid API key is required" }, { status: 401 });
    }

    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const title = typeof (body as { title?: unknown })?.title === "string"
        ? (body as { title: string }).title.trim()
        : "";
    const iconValue = typeof (body as { icon?: unknown })?.icon === "string"
        ? (body as { icon: string }).icon.trim()
        : "";
    const content = typeof (body as { content?: unknown })?.content === "string"
        ? (body as { content: string }).content.trim()
        : null;
    const category = typeof (body as { category?: unknown })?.category === "string"
        ? (body as { category: string }).category.trim()
        : null;
    const fields = normalizeFields((body as { fields?: unknown })?.fields);
    const steps = normalizeSteps((body as { events?: unknown })?.events);
    const actions = normalizeActions((body as { actions?: unknown })?.actions);
    const data = (body as { data?: unknown })?.data;

    if (!title) {
        return NextResponse.json({ error: "title is required" }, { status: 400 });
    }

    const icon = iconValue || "🔔";
    const time = new Date().toISOString();

    const event = await db.event.create({
        data: {
            projectId: key.projectId,
            apiKeyId: key.id,
            title,
            icon,
            time,
            content,
            category,
            fields: fields ?? undefined,
            events: steps ?? undefined,
            actions: actions ?? undefined,
            data: data ?? undefined,
        },
        select: {
            id: true,
            projectId: true,
            apiKeyId: true,
            title: true,
            icon: true,
            time: true,
            content: true,
            category: true,
            fields: true,
            events: true,
            data: true,
            actions: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    // Fire webhooks async — don't await, don't block response
    void fireWebhooks(key.projectId, event as Record<string, unknown>);

    return NextResponse.json({ success: true, event }, { status: 201 });
}
