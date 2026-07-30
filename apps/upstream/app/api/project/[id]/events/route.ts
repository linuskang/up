import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"

interface RouteParams {
    id: string
}

export async function GET(
    _request: NextRequest,
    {
        params,
    }: {
        params: Promise<RouteParams>
    }
) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json("Unauthorized", {
            status: 401,
        })
    }

    const { id } = await params

    const project = await prisma.project.findFirst({
        where: {
            id: id,
            ownerId: session.user.id,
        },
        select: {
            id: true,
            name: true,
        },
    })

    if (!project) {
        return NextResponse.json("Project not found", {
            status: 404,
        })
    }

    const { searchParams } = new URL(_request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)
    const category = searchParams.get("category")

    const skip = (page - 1) * limit

    const events = await prisma.event.findMany({
        where: {
            projectId: id,
            ...(category && category !== "all"
                ? { category: category === "none" ? null : category }
                : {}),
        },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    })

    const contextIds = events
        .map((event) => event.contextId)
        .filter((contextId): contextId is string => Boolean(contextId))

    let linkedEvents: typeof events = []
    if (contextIds.length > 0) {
        linkedEvents = await prisma.event.findMany({
            where: {
                projectId: id,
                contextId: {
                    in: contextIds,
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        })
    }

    const eventsWithLinked = events.map((event) => {
        const related = event.contextId
            ? linkedEvents.filter(
                  (linked) =>
                      linked.contextId === event.contextId &&
                      linked.id !== event.id
              )
            : []

        return {
            ...event,
            events:
                related.length > 0
                    ? related.map((linked) => ({
                          title: linked.title,
                          icon: linked.icon,
                          createdAt: linked.createdAt.toISOString(),
                      }))
                    : event.events,
            project,
        }
    })

    return NextResponse.json(eventsWithLinked, {
        status: 200,
    })
}
