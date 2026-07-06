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
        return NextResponse.json(
            "Unauthorized",
            {
                status: 401,
            }
        )
    }

    const { id } = await params

    const project = await prisma.project.findFirst({
        where: {
            id: id,
            ownerId: session.user.id,
        },
        select: {
            id: true,
        },
    })

    if (!project) {
        return NextResponse.json(
            "Project not found",
            {
                status: 404,
            }
        )
    }

    const totalCount = await prisma.event.count({
        where: { projectId: id },
    })

    const grouped = await prisma.event.groupBy({
        by: ["category"],
        where: { projectId: id },
        _count: { id: true },
    })

    const categories = grouped.map((g) => ({
        name: g.category ?? "none",
        count: g._count.id,
    }))

    return NextResponse.json(
        {
            total: totalCount,
            categories,
        },
        {
            status: 200,
        }
    )
}
