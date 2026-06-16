import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/server/auth"
import { Project } from "@/server/utils"
import { plans } from "@/lib/plans"
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

    // Check project quota
    const projectCount = await Project.count(session.user.id)
    const user = await prisma.user.findUnique({
        where: {
            id: session.user.id,
        },
        select: {
            plan: true,
        },
    })

    const userPlan = user?.plan.toLowerCase() as keyof typeof plans ?? "free"
    const limit = plans[userPlan].maxProjects

    if (projectCount >= limit) {
        return NextResponse.json(
            {
                error: "Project limit reached. Upgrade your plan to create more projects.",
            },
            {
                status: 403,
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
