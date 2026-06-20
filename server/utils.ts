import { prisma } from "@/server/prisma"
import { plans } from "@/lib/plans"
import crypto from "crypto"
import { UsageStats, WebhookEventPayload } from "@/types"

export class Api {
    static async validateKey(apiKey: string): Promise<{ valid: boolean; projectId?: string }> {
        if (!apiKey.startsWith("up_")) {
            return { valid: false }
        }

        const hash = crypto.createHash("sha256").update(apiKey).digest("hex")

        const key = await prisma.apiKey.findUnique({
            where: {
                key: hash,
            },
        })

        if (!key || !key.active) {
            return { valid: false }
        }

        await prisma.apiKey.update({
            where: {
                id: key.id,
            },
            data: {
                lastUsed: new Date(),
            },
        })

        return { valid: true, projectId: key.projectId }
    }

    static async log(
        projectId: string,
        endpoint: string,
        method: string,
        status: number,
        userAgent: string | null,
        requestBody: string | null,
        responseBody: string | null
    ) {
        const res = await prisma.requestLog.create(
            {
                data: {
                    projectId,
                    endpoint,
                    method,
                    status,
                    userAgent,
                    requestBody: requestBody ?? undefined,
                    responseBody: responseBody ?? undefined,
                }
            }
        )

        return res;
    }
}

export class Usage {
    static async increment(userId: string) {
        const month = new Date().toISOString().slice(0, 7)

        const usage = await prisma.userUsage.upsert({
            where: {
                userId_month: {
                    userId,
                    month,
                },
            },
            update: {
                eventCount: {
                    increment: 1,
                },
            },
            create: {
                userId,
                month,
                eventCount: 1,
            },
        })

        return usage
    }

    static async decrement(userId: string) {
        const month = new Date().toISOString().slice(0, 7)

        await prisma.userUsage.update({
            where: {
                userId_month: {
                    userId,
                    month,
                },
            },
            data: {
                eventCount: {
                    decrement: 1,
                },
            },
        })
    }

    static async getStats(userId: string): Promise<UsageStats> {
        // Count total projects
        const projectCount = await prisma.project.count({
            where: {
                ownerId: userId,
            },
        })

        // Count events today
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const eventsToday = await prisma.event.count({
            where: {
                project: {
                    ownerId: userId,
                },
                createdAt: {
                    gte: today,
                },
            },
        })

        // Get monthly usage
        const month = new Date().toISOString().slice(0, 7)
        const monthlyUsage = await prisma.userUsage.findUnique({
            where: {
                userId_month: {
                    userId,
                    month,
                },
            },
        })

        // Get user plan
        const user = await prisma.user.findUnique({
            where: {
                id: userId,
            },
            select: {
                plan: true,
            },
        })

        const plan = (user?.plan ?? "FREE").toLowerCase() as keyof typeof plans
        const planConfig = plans[plan]

        const planDisplay = (user?.plan ?? "FREE").toLowerCase().replace(/^\w/, (c) => c.toUpperCase())

        return {
            plan: planDisplay,
            projects: {
                current: projectCount,
                limit: planConfig.maxProjects,
            },
            eventsToday: {
                current: eventsToday,
            },
            eventsMonth: {
                current: monthlyUsage?.eventCount ?? 0,
                limit: planConfig.maxEventsPerMonth,
            },
        }
    }
}

export class Project {
    static async delete(projectId: string) {
        await prisma.project.delete({
            where: {
                id: projectId,
            },
        })
        return true
    }

    static async create(ownerId: string, name: string) {
        const newProject = await prisma.project.create({
            data: {
                name,
                ownerId,
            },
        })

        return newProject
    }

    static async rename(projectId: string, name: string) {
        await prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                name,
            },
        })
        return true
    }

    static async addApiKey(projectId: string, addedById: string, name: string) {
        const apiKey = "up_" + crypto.randomUUID().replace(/-/g, "")
        const hash = crypto.createHash("sha256").update(apiKey).digest("hex")

        // TODO: add hint to api key that records first 4 characters
        // e.g. "up_jt83..."

        await prisma.apiKey.create({
            data: {
                name,
                key: hash,
                addedById,
                projectId,
            },
        })

        return apiKey
    }

    static async count(ownerId: string) {
        const count = await prisma.project.count({
            where: {
                ownerId,
            },
        })

        return count
    }

    static async getOwner(projectId: string) {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId,
            },
            select: {
                ownerId: true,
                owner: {
                    select: {
                        id: true,
                        plan: true,
                    },
                },
            },
        })

        return project?.owner ?? null
    }

    static async log(
        projectId: string,
        userId: string,
        message: string
    ) {
        const res = await prisma.auditLog.create(
            {
                data: {
                    projectId,
                    userId,
                    message,
                }
            }
        )

        return res;
    }

    static async newWebhook(
        projectId: string,
        name: string,
        subscription: string,
        url: string,
    ) {
        const res = await prisma.webhook.create(
            {
                data: {
                    projectId,
                    name,
                    subscription,
                    url,
                }
            }
        )

        return res;
    }

    static async getWebhooks(projectId: string) {
        const webhooks = await prisma.webhook.findMany(
            {
                where: {
                    projectId,
                }
            }
        )

        return webhooks;
    }

    static async triggerWebhooks(
        projectId: string,
        subscription: string,
        event: WebhookEventPayload,
    ) {
        const webhooks = await prisma.webhook.findMany(
            {
                where: {
                    projectId,
                    subscription,
                    enabled: true
                }
            }
        )

        for (const webhook of webhooks) {
            await prisma.webhook.update(
                {
                    where: { id: webhook.id },
                    data: {
                        lastTriggered: new Date(),
                    },
                }
            )

            fetch(webhook.url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(event),
            }).catch((err) => {
                console.log(err)
            })
        }
    }
}