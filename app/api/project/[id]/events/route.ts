import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/server/auth"
import { prisma } from "@/server/prisma"

interface RouteParams {
    id: string
}

export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<RouteParams>
    }
) {
    const session = await auth.api.getSession(
        {
            headers: request.headers,
        }
    )

    if (!session) {
        return NextResponse.json(
            {
                error: "Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    const { id } = await params

    const project = await prisma.project.findFirst(
        {
            where: {
                id: id,
                ownerId: session.user.id,
            },
            select: {
                id: true,
            }
        }
    )

    if (!project) {
        return NextResponse.json(
            {
                error: "Project not found",
            },
            {
                status: 404,
            }
        )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get("page") || "1", 10)
    const limit = parseInt(searchParams.get("limit") || "20", 10)

    const skip = (page - 1) * limit

    const events = await prisma.event.findMany({
        where: {
            projectId: id,
        },
        orderBy: {
            createdAt: "desc",
        },
        skip,
        take: limit,
    })

    return NextResponse.json(
        events,
        {
            status: 200,
        }
    )
}
