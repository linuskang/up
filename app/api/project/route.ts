import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/server/auth"
import { Project } from "@/server/utils"
import { prisma } from "@/server/prisma"

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await request.headers,
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

    const projects = await prisma.project.findMany({
        where: {
            ownerId: session.user.id,
        },
        select: {
            id: true,
            name: true,
        },
    })

    return NextResponse.json(
        {
            projects,
        },
        {
            status: 200,
        }
    )
}

export async function POST(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: await request.headers,
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

    const body = await request.json()

    if (!body.name) {
        return NextResponse.json(
            {
                error: "Missing required fields",
            },
            {
                status: 400,
            }
        )
    }

    const newProject = await Project.create(session.user.id, body.name)

    return NextResponse.json(
        {
            success: true,
            projectId: newProject.id,
        },
        {
            status: 201,
        }
    )
}
