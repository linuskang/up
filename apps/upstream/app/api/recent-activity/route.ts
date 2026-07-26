import { NextResponse } from "next/server"
import { getSession } from "@/server/auth"
import { prisma } from "@/server/prisma"

export async function GET() {
    const session = await getSession()

    if (!session) {
        return NextResponse.json("Unauthorized", {
            status: 401,
        })
    }

    const activities = await prisma.auditLog.findMany({
        where: {
            project: {
                ownerId: session.user.id,
            },
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 10,
        include: {
            project: {
                select: {
                    id: true,
                    name: true,
                },
            },
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
    })

    return NextResponse.json(
        {
            activities,
        },
        { status: 200 }
    )
}
