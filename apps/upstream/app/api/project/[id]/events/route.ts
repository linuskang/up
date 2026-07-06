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

    return NextResponse.json(
        events,
        {
            status: 200,
        }
    )
}
