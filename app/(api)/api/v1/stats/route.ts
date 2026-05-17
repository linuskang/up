import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memberships = await db.projectMember.findMany({
        where: { userId: session.user.id },
        select: { projectId: true },
    });

    const projectIds = memberships.map((m: any) => m.projectId);

    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);

    const [eventsToday, eventsTotal] = await Promise.all([
        db.event.count({
            where: {
                projectId: { in: projectIds },
                createdAt: { gte: todayStart },
            },
        }),
        db.event.count({
            where: {
                projectId: { in: projectIds },
            },
        }),
    ]);

    return NextResponse.json({ eventsToday, eventsTotal }, { status: 200 });
}
