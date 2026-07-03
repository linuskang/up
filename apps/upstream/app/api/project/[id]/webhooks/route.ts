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

    const { id } = await params

    const project = await prisma.project.findUnique(
        {
            where: {
                id,
                ownerId: session.user.id,
            },
            include: {
                webhooks: true,
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

    return NextResponse.json(
        {
            webhooks: project.webhooks,
        },
        {
            status: 200,
        }
    )
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

    const { id } = await params

    const body = await request.json()

    if (!body.name || !body.subscription || !body.url) {
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

    const webhook = await Project.newWebhook(
        id,
        body.name,
        body.subscription,
        body.url,
    )

    await Project.log(
        id,
        session.user.id,
        `Created webhook ${body.name}`

    )

    return NextResponse.json(
        {
            webhook,
        },
        {
            status: 200,
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

    const { id } = await params

    const body = await request.json()

    if (!body.webhookId) {
        return NextResponse.json(
            {
                error: "Missing webhook id",
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

    const webhook = await prisma.webhook.findUnique(
        {
            where: {
                id: body.webhookId,
                projectId: id,
            },
        }
    )

    if (!webhook) {
        return NextResponse.json(
            {
                error: "Webhook not found",
            },
            {
                status: 404,
            }
        )
    }

    await prisma.webhook.delete(
        {
            where: {
                id: body.webhookId,
            },
        }
    )

    await Project.log(
        id,
        session.user.id,
        `Deleted webhook ${webhook.name}`
    )

    return NextResponse.json(
        {
            success: true,
        },
        {
            status: 200,
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

    const { id } = await params

    const body = await request.json()

    if (!body.webhookId) {
        return NextResponse.json(
            {
                error: "Missing webhook id",
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

    const webhook = await prisma.webhook.findUnique(
        {
            where: {
                id: body.webhookId,
                projectId: id,
            },
        }
    )

    if (!webhook) {
        return NextResponse.json(
            {
                error: "Webhook not found",
            },
            {
                status: 404,
            }
        )
    }

    const data: Record<string, unknown> = {}
    if (body.name !== undefined) data.name = body.name
    if (body.url !== undefined) data.url = body.url
    if (body.subscription !== undefined) data.subscription = body.subscription
    if (body.enabled !== undefined) data.enabled = body.enabled

    const updated = await prisma.webhook.update(
        {
            where: {
                id: body.webhookId,
            },
            data,
        }
    )

    await Project.log(
        id,
        session.user.id,
        `Updated webhook ${body.name}`
    )

    return NextResponse.json(
        {
            webhook: updated,
        },
        {
            status: 200,
        }
    )
}