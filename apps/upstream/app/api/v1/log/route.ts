import { NextRequest } from "next/server"
import { Api, Usage, Project, User } from "@/server/utils"
import { BadRequest, Unauthorized, NotFound, Success } from "@/app/api/responses"
import { plans } from "@/server/vars"
import { z } from "zod"
import { prisma } from "@/server/prisma"

const EventPayload = z.object({
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
})

export async function POST(req: NextRequest) {
    const apiKey = req.headers.get("x-api-key")

    if (!apiKey) {
        return BadRequest("API key is required")
    }

    const validate: { valid: boolean; projectId?: string } = await Api.validateKey(apiKey)

    if (!validate.valid) {
        return Unauthorized("Invalid API key")
    }

    const project = await Project.get(validate.projectId!)

    if (!project) {
        return NotFound("Project not found")
    }

    const user = await User.get(project.ownerId)

    if (!user) {
        return NotFound("User not found")
    }

    const usage = await Usage.increment(user.id)
    const limit = user.plan

    const plan = plans[limit]
    const body = await req.json() // as [TYPE]

    if (usage.eventCount > plan.maxEventsPerMonth) {
        await Usage.decrement(user.id)
        await Api.log(
            project.id,
            "/api/v1/log",
            "POST",
            429,
            req.headers.get("user-agent"),
            JSON.stringify(body),
            JSON.stringify({
                error: "Monthly event quota exceeded. Upgrade your plan to ingest more events.",
            })
        )
        return BadRequest("Monthly event quota exceeded. Upgrade your plan to ingest more events.")
    }

    const parsed = EventPayload.safeParse(body)

    if (!parsed.success) {
        await Api.log(
            project.id,
            "/api/v1/log",
            "POST",
            400,
            req.headers.get("user-agent"),
            JSON.stringify(body),
            JSON.stringify({
                error: "Invalid request body",
            })
        )
        return BadRequest("Invalid request body")
    }

    const event = parsed.data

    const res = await prisma.event.create({
        data: {
            projectId: project.id,
            title: event.title,
            icon: event.icon,
            content: event.content,
            category: event.category,
            fields: event.fields ?? undefined,
            events: event.events ?? undefined,
            data: event.data ?? undefined,
            actions: event.actions ?? undefined,
        },
    })

    await Api.log(
        project.id,
        "/api/v1/log",
        "POST",
        200,
        req.headers.get("user-agent"),
        JSON.stringify(body),
        JSON.stringify(res)
    )

    if (res.category) {
        await Project.triggerWebhooks(project.id, res.category, res)
    }

    return Success("Event created successfully", res)
}