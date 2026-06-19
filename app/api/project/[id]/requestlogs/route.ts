import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/prisma"
import { auth } from "@/server/auth"

interface postParams {
    id: string
}

export async function GET(
    request: NextRequest,
    {
        params,
    }: {
        params: Promise<postParams>
    }
) {
    const session = await auth.api.getSession({
        headers: request.headers,
    })

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

    const project = await prisma.project.findUnique(
        {
            where: {
                id,
                ownerId: session.user.id,
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

    const requestLogs = await prisma.requestLog.findMany(
        {
            where: {
                projectId: id,
            }
        }
    )

    return NextResponse.json(
        {
            requestLogs,
        },
        {
            status: 200,
        }
    )
}