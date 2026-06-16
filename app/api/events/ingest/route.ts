import { NextRequest, NextResponse } from "next/server"
import { Api, Usage } from "@/server/utils"
import { plans } from "@/lib/plans"
import { z } from "zod"
import { prisma } from "@/server/prisma"

const eventSchema = z.object(
    {
        title: z.string().min(1),
        icon: z.string().min(1),
        content: z.string().optional().nullable(),
        category: z.string().optional().nullable(),
        fields: z
            .array(
                z.object({
                    name: z.string(),
                    value: z.string(),
                })
            )
            .optional()
            .nullable(),
        events: z
            .array(
                z.object({
                    icon: z.string(),
                    time: z.string(),
                    content: z.string(),
                })
            )
            .optional()
            .nullable(),
        data: z.any().optional().nullable(),
        actions: z
            .array(
                z.object({
                    title: z.string(),
                    type: z.enum(["default", "secondary", "ghost"]),
                    url: z.string().url(),
                })
            )
            .optional()
            .nullable(),
    }
)

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get("x-api-key")

    if (!apiKey) {
        return NextResponse.json(
            {
                error: "API key is required",
            },
            {
                status: 401,
            }
        )
    }

    const keyValidation = await Api.validateKey(apiKey)

    if (!keyValidation.valid) {
        return NextResponse.json(
            {
                error: "Invalid API key",
            },
            {
                status: 401,
            }
        )
    }

    // Get the project owner and check quota
    const project = await prisma.project.findUnique({
        where: {
            id: keyValidation.projectId,
        },
        select: {
            ownerId: true,
        },
    })

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

    const user = await prisma.user.findUnique({
        where: {
            id: project.ownerId,
        },
        select: {
            id: true,
            plan: true,
        },
    })

    if (!user) {
        return NextResponse.json(
            {
                error: "User not found",
            },
            {
                status: 500,
            }
        )
    }

    // Increment monthly usage and check quota
    const usage = await Usage.increment(user.id)
    const userPlan = user.plan.toLowerCase() as keyof typeof plans
    const limit = plans[userPlan].maxEventsPerMonth

    if (usage.eventCount > limit) {
        await Usage.decrement(user.id)

        return NextResponse.json(
            {
                error: "Monthly event quota exceeded. Upgrade your plan to ingest more events.",
            },
            {
                status: 429,
            }
        )
    }

    const body = await req.json()


    const parseResult = eventSchema.safeParse(body)

    if (!parseResult.success) {
        return NextResponse.json(
            {
                error: "Invalid request body",
            },
            {
                status: 400,
            }
        )
    }

    const events = parseResult.data

    const result = await prisma.event.create(
        {
            data: {
                projectId: keyValidation.projectId!,
                title: events.title,
                icon: events.icon,
                content: events.content,
                category: events.category,
                fields: events.fields ?? undefined,
                events: events.events ?? undefined,
                data: events.data ?? undefined,
                actions: events.actions ?? undefined,
            }
        }
    )

    return NextResponse.json(
        {
            success: true,
            result,
        },
        {
            status: 201,
        }
    )
}
