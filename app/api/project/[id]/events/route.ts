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
                events: true,
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

    return NextResponse.json(
        project.events,
        {
            status: 200,
        }
    )
}
