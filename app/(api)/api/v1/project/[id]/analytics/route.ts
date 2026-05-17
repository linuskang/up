import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { getProjectMembership } from "@/server/projects";
import { subDays, startOfDay, format } from "date-fns";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;

    const access = await getProjectMembership(request, id);

    if ("error" in access) {
        return access.error;
    }

    const now = new Date();
    const thirtyDaysAgo = startOfDay(subDays(now, 29));

    // Fetch all events in the last 30 days
    const events = await db.event.findMany({
        where: {
            projectId: id,
            createdAt: { gte: thirtyDaysAgo },
        },
        select: {
            createdAt: true,
            category: true,
        },
        orderBy: { createdAt: "asc" },
    });

    // Build daily counts for last 30 days
    const dailyMap: Record<string, number> = {};
    for (let i = 29; i >= 0; i--) {
        const day = format(subDays(now, i), "MMM d");
        dailyMap[day] = 0;
    }
    for (const event of events) {
        const day = format(new Date(event.createdAt), "MMM d");
        if (day in dailyMap) {
            dailyMap[day] = (dailyMap[day] ?? 0) + 1;
        }
    }
    const dailyEvents = Object.entries(dailyMap).map(([date, count]) => ({ date, count }));

    // Category breakdown
    const categoryMap: Record<string, number> = {};
    for (const event of events) {
        const cat = event.category || "uncategorized";
        categoryMap[cat] = (categoryMap[cat] ?? 0) + 1;
    }
    const categoryBreakdown = Object.entries(categoryMap)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

    // Total events all time
    const totalEvents = await db.event.count({ where: { projectId: id } });

    // Today's events
    const todayStart = startOfDay(now);
    const eventsToday = await db.event.count({
        where: { projectId: id, createdAt: { gte: todayStart } },
    });

    // Events this week
    const weekStart = startOfDay(subDays(now, 6));
    const eventsThisWeek = await db.event.count({
        where: { projectId: id, createdAt: { gte: weekStart } },
    });

    return NextResponse.json(
        { dailyEvents, categoryBreakdown, totalEvents, eventsToday, eventsThisWeek },
        { status: 200 }
    );
}
