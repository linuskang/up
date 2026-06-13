import { NextRequest, NextResponse } from "next/server"
import { Api } from "@/server/utils"
import { z } from "zod"
import { prisma } from "@/server/prisma"

const eventSchema = z.object(
    {
        title: z.string().min(1),
        icon: z.string().min(1),
        time: z.string().min(1),
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
                time: events.time,
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
