import { prisma } from "@/server/prisma"
import { plans } from "@/lib/plans"
import crypto from "crypto"
import { UsageStats } from "@/types"

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
}