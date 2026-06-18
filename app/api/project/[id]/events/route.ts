import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/server/auth"
import { prisma } from "@/server/prisma"
import { plans } from "@/lib/plans"

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

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { plan: true },
    })

    const userPlan = (user?.plan ?? "FREE").toLowerCase() as keyof typeof plans
    const retentionDays = plans[userPlan].retentionDays
    const cutoff = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000)

    const events = await prisma.event.findMany({
        where: {
            projectId: id,
            createdAt: {
                gte: cutoff,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    })

    return NextResponse.json(
        events,
        {
            status: 200,
        }
    )
}
