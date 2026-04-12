import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import {
    eventInputSchema,
    eventListQuerySchema,
    getProjectApiKey,
    getProjectSessionMembership,
    projectEventSelect,
    serializeProjectEvent,
} from "@/server/events";

function getProjectId(request: NextRequest) {
    return request.nextUrl.searchParams.get("projectId")?.trim() || "";
}

export async function GET(request: NextRequest) {
    const projectId = getProjectId(request);

    if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const sessionAccess = await getProjectSessionMembership(request, projectId);
    const apiKeyAccess = await getProjectApiKey(request, projectId);

    if (!sessionAccess && !apiKeyAccess) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsedQuery = eventListQuerySchema.safeParse({
        page: request.nextUrl.searchParams.get("page") ?? undefined,
        pageSize: request.nextUrl.searchParams.get("pageSize") ?? undefined,
        search: request.nextUrl.searchParams.get("search") ?? undefined,
        category: request.nextUrl.searchParams.get("category") ?? undefined,
    });

    if (!parsedQuery.success) {
        return NextResponse.json({ error: "Invalid query parameters" }, { status: 400 });
    }

    const { page, pageSize } = parsedQuery.data;
    const search = parsedQuery.data.search?.trim();
    const category = parsedQuery.data.category?.trim();
    const skip = (page - 1) * pageSize;

    const where = {
        projectId,
        ...(category ? { category } : {}),
        ...(search
            ? {
                OR: [
                    { title: { contains: search, mode: "insensitive" as const } },
                    { content: { contains: search, mode: "insensitive" as const } },
                    { category: { contains: search, mode: "insensitive" as const } },
                    { time: { contains: search, mode: "insensitive" as const } },
                ],
            }
            : {}),
    };

    const [total, events] = await db.$transaction([
        db.event.count({ where }),
        db.event.findMany({
            where,
            orderBy: [
                { createdAt: "desc" },
                { id: "desc" },
            ],
            skip,
            take: pageSize,
            select: projectEventSelect,
        }),
    ]);

    const totalPages = Math.max(1, Math.ceil(total / pageSize));

    return NextResponse.json(
        {
            events: events.map(serializeProjectEvent),
            meta: {
                page,
                pageSize,
                total,
                totalPages,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1,
            },
        },
        { status: 200 }
    );
}

export async function POST(request: NextRequest) {
    let body: unknown;

    try {
        body = await request.json();
    } catch {
        return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const projectId = typeof (body as { projectId?: unknown })?.projectId === "string"
        ? (body as { projectId: string }).projectId.trim()
        : "";

    if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const sessionAccess = await getProjectSessionMembership(request, projectId);
    const apiKeyAccess = await getProjectApiKey(request, projectId);

    if (!sessionAccess && !apiKeyAccess) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const parsed = eventInputSchema.safeParse(body);

    if (!parsed.success) {
        return NextResponse.json({ error: "Invalid event payload" }, { status: 400 });
    }

    const event = await db.event.create({
        data: {
            project: {
                connect: {
                    id: projectId,
                },
            },
            title: parsed.data.title,
            icon: parsed.data.icon || "📣",
            time: parsed.data.time?.trim() || new Intl.DateTimeFormat("en-US", {
                hour: "numeric",
                minute: "2-digit",
            }).format(new Date()),
            content: parsed.data.content?.trim() || null,
            category: parsed.data.category?.trim() || null,
            ...(apiKeyAccess ? { apiKeyId: apiKeyAccess.id } : {}),
            ...(parsed.data.fields && parsed.data.fields.length > 0 ? { fields: parsed.data.fields } : {}),
            ...(parsed.data.events && parsed.data.events.length > 0 ? { events: parsed.data.events } : {}),
            ...(parsed.data.data !== undefined && parsed.data.data !== null ? { data: parsed.data.data } : {}),
            ...(parsed.data.actions && parsed.data.actions.length > 0 ? { actions: parsed.data.actions } : {}),
        },
        select: projectEventSelect,
    });

    return NextResponse.json({ event: serializeProjectEvent(event) }, { status: 201 });
}
