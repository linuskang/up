import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/server/prisma"
import { env } from "@/env"
import { plans } from "@/lib/plans"
import { Plan } from "@/generated/prisma/client"

export async function POST(request: NextRequest) {
    const authHeader = request.headers.get("x-api-key")
    const expected = env.CRON_SECRET ? `${env.CRON_SECRET}` : null

    if (!expected) {
        return NextResponse.json(
            { error: "Cron secret not configured" },
            { status: 503 }
        )
    }

    if (authHeader !== expected) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        )
    }

    let totalDeleted = 0
    const details: Record<string, { events: number; auditLogs: number }> = {}

    for (const [planKey, planConfig] of Object.entries(plans)) {
        const cutoff = new Date(
            Date.now() - planConfig.retentionDays * 24 * 60 * 60 * 1000
        )

        const eventResult = await prisma.event.deleteMany({
            where: {
                project: {
                    owner: {
                        plan: planKey.toUpperCase() as Plan,
                    },
                },
                createdAt: {
                    lt: cutoff,
                },
            },
        })

        const auditLogResult = await prisma.auditLog.deleteMany({
            where: {
                project: {
                    owner: {
                        plan: planKey.toUpperCase() as Plan,
                    },
                },
                createdAt: {
                    lt: cutoff,
                },
            },
        })

        details[planKey] = {
            events: eventResult.count,
            auditLogs: auditLogResult.count,
        }
        totalDeleted += eventResult.count + auditLogResult.count
    }

    return NextResponse.json(
        {
            success: true,
            deleted: totalDeleted,
            details,
        },
        { status: 200 }
    )
}
