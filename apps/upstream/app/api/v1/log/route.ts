
// curl -X POST https://up.linus.my/api/v1/log \
// -H "x-api-key: YOUR_API_KEY" \
// -H "Content-Type: application/json" \
// -d '{
//     "title": "Test Event",
//     "icon": "~"
//   }'

// Libraries
import { NextRequest } from "next/server"
import { z } from "zod"

// Utilities
import { prisma } from "@/server/prisma"

import {
    Api,
    Usage,
    Project,
    User
} from "@/server/utils"
import { sendPushNotification } from "@/server/push-notify"

import { ApiResponse } from "@/app/api/responses"
import { plans } from "@/server/vars"

// Types
const Payload = z.object({
    title: z.string().min(1),
    icon: z.string().min(1).max(1).optional(),

    description: z.string().optional().nullable(),
    category: z.string().optional().nullable(),

    fields: z
        .array(
            z.object({
                title: z.string(),
                value: z.string(),
            })
        )
        .optional()
        .nullable(),
    events: z
        .array(
            z.object({
                title: z.string(),
                icon: z.string(),
                createdAt: z.string(),
            })
        )
        .optional()
        .nullable(),
    actions: z
        .array(
            z.object({
                title: z.string(),
                variant: z.enum(["primary", "secondary", "ghost"]),
                url: z.url(),
            })
        )
        .optional()
        .nullable(),
    data: z.json().optional().nullable(),

    pushNotify: z.boolean().default(false),
})

export async function POST(req: NextRequest) {
    // Pre-flight checks
    const apiKey = req.headers.get("x-api-key")

    if (!apiKey) {
        return ApiResponse.BadRequest("API key is required")
    }

    const validate: {
        valid: boolean;
        projectId?: string
    } = await Api.validateKey(apiKey)

    if (!validate.valid) {
        return ApiResponse.Unauthorized("Invalid API key")
    }

    const project = await Project.get(validate.projectId!)

    if (!project) {
        return ApiResponse.NotFound("Project not found")
    }

    const user = await User.get(project.ownerId)

    if (!user) {
        return ApiResponse.NotFound("User not found")
    }

    // Logging
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
        return ApiResponse.BadRequest("Monthly event quota exceeded. Upgrade your plan to ingest more events.")
    }

    const parsed = Payload.safeParse(body)

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
        await Usage.decrement(user.id) // Undos usage if errored, v0.2.4 improvement
        return ApiResponse.BadRequest("Invalid request body")
    }

    const event = parsed.data

    const res = await prisma.event.create({
        data: {
            projectId: project.id,
            title: event.title,
            icon: event.icon,
            content: event.description,
            category: event.category,
            fields: event.fields ?? undefined,
            events: event.events ?? undefined,
            data: event.data ?? undefined,
            actions: event.actions ?? undefined,
            pushNotify: event.pushNotify,
        },
    })

    await Api.log(
        project.id,
        "/api/v1/log",
        "POST",
        201,
        req.headers.get("user-agent"),
        JSON.stringify(body),
        JSON.stringify(res)
    )

    if (res.category) {
        await Project.triggerWebhooks(project.id, res.category, res)
    }

    if (res.pushNotify) {
        await sendPushNotification(user.id, {
            title: res.title,
            body: res.content ?? "triggered a notification",
        })
    }

    return ApiResponse.Success(undefined, { event: res })
}