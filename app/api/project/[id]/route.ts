import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { Project } from "@/server/utils";

interface postParams {
    id: string
}

export async function GET(
    request: NextRequest,
    { params }: {
        params: Promise<postParams>
    }
) {
    const session = await auth.api.getSession(
        {
            headers: request.headers
        }
    );

    if (!session) {
        return NextResponse.json(
            {
                error: 'Unauthorized'
            },
            {
                status: 401
            }
        )
    }

    const { id } = await params

    const project = await Project.get(id);

    if (!project) {
        return NextResponse.json(
            {
                error: 'Project not found'
            },
            {
                status: 404
            }
        )
    }

    if (project.ownerId !== session.user.id) {
        return NextResponse.json(
            {
                error: 'Forbidden'
            },
            {
                status: 403
            }
        )
    }

    return NextResponse.json(
        {
            success: true,
            project: {
                id: project.id,
                name: project.name,
                apiKeys: project.apiKeys.map(apiKey => ({
                    id: apiKey.id,
                    name: apiKey.name,
                    addedById: apiKey.addedById,
                    createdAt: apiKey.createdAt,
                }))
            }
        }
    )
}

export async function DELETE(
    request: NextRequest,
    { params }: {
        params: Promise<postParams>
    }
) {
    const session = await auth.api.getSession(
        {
            headers: request.headers
        }
    );

    if (!session) {
        return NextResponse.json(
            {
                error: 'Unauthorized'
            },
            {
                status: 401
            }
        )
    }

    const { id } = await params

    const project = await Project.get(id);

    if (!project) {
        return NextResponse.json(
            {
                error: 'Project not found'
            },
            {
                status: 404
            }
        )
    }

    if (project.ownerId !== session.user.id) {
        return NextResponse.json(
            {
                error: 'Forbidden'
            },
            {
                status: 403
            }
        )
    }

    await Project.delete(id);

    return NextResponse.json(
        {
            success: true,
        }
    )
}