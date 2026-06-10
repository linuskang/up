import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { Project } from "@/server/utils";

export async function POST(
    request: NextRequest,
) {
    const session = await auth.api.getSession(
        {
            headers: await request.headers
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

    const body = await request.json();

    if (!body.name) {
        return NextResponse.json(
            {
                error: 'Missing required fields'
            },
            {
                status: 400
            }
        )
    }

    const newProject = await Project.create(
        session.user.id,
        body.name
    );

    return NextResponse.json(
        {
            success: true,
            projectId: newProject.id
        },
        {
            status: 201
        }
    )
}