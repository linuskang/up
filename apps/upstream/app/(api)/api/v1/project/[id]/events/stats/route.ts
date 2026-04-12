import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { getProjectApiKey, getProjectSessionMembership } from "@/server/events";

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const sessionAccess = await getProjectSessionMembership(request, id);
    const apiKeyAccess = await getProjectApiKey(request, id);

    if (!sessionAccess && !apiKeyAccess) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const now = new Date();
    const dayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const [total, last24h, categoryGroups] = await db.$transaction([
        db.event.count({ where: { projectId: id } }),
        db.event.count({
            where: {
                projectId: id,
                createdAt: {
                    gte: dayAgo,
                },
            },
        }),
        db.event.groupBy({
            by: ["category"],
            where: {
                projectId: id,
                category: {
                    not: null,
                },
            },
            _count: {
                _all: true,
            },
        }),
    ]);

    const categories = categoryGroups
        .map((group) => ({
            name: group.category || "uncategorized",
            count: group._count._all,
        }))
        .sort((left, right) => right.count - left.count);

    return NextResponse.json(
        {
            total,
            last24h,
            categories,
        },
        { status: 200 }
    );
}
