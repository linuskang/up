import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/server/auth"
import { Project } from "@/server/utils"
import { prisma } from "@/server/prisma"

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
            },

            select: {
                name: true,
                id: true,
                owner: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    }
                },
                apiKeys: {
                    select: {
                        id: true,
                        name: true,
                        createdAt: true,
                        active: true,
                        lastUsed: true,
                        addedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            }
                        },
                    },
                },
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
        {
            project
        }
    )
}

export async function PATCH(
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

    const project = await prisma.project.findUnique(
        {
            where: {
                id,
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

    await Project.rename(id, body.name)
    await Project.log(
        id,
        session.user.id,
        `Renamed project to ${body.name}`
    )

    return NextResponse.json(
        {
            success: true,
        }
    )
}

export async function DELETE(
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

    await Project.delete(id)

    return NextResponse.json(
        {
            success: true,
        }
    )
}
