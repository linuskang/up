import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/prisma"
import { Project } from "@/server/utils"
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
            },
            include: {
                apiKeys: {
                    include: {
                        addedBy: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
            },
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

    const keys = project.apiKeys.map((key) => (
        {
            id: key.id,
            name: key.name,
            createdAt: key.createdAt,
            lastUsed: key.lastUsed,
            addedBy: key.addedBy,
            active: key.active,
        }
    ))

    return NextResponse.json({
        keys,
    })
}

export async function POST(
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

    const key = await Project.addApiKey(id, session.user.id, body.name)

    return NextResponse.json(
        {
            success: true,
            key,
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
    const body = await request.json()

    if (!body.keyId) {
        return NextResponse.json(
            {
                error: "Missing required fields",
            },
            {
                status: 400,
            }
        )
    }

    const key = await prisma.apiKey.findUnique(
        {
            where: {
                id: body.keyId,
                projectId: id,
            },
        }
    )

    if (!key) {
        return NextResponse.json(
            {
                error: "API key not found",
            },
            {
                status: 404,
            }
        )
    }

    await prisma.apiKey.delete(
        {
            where: {
                id: body.keyId,
                projectId: id,
            },
        }
    )

    return NextResponse.json(
        {
            success: true,
        },
        {
            status: 201,
        }
    )
}