import { NextRequest, NextResponse } from "next/server";
import db from "@/server/prisma";
import { auth } from "@/server/auth";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const invitations = await db.projectInvitation.findMany({
        where: {
            email: session.user.email,
            acceptedAt: null,
            expiresAt: { gt: new Date() },
        },
        orderBy: { createdAt: "desc" },
        select: {
            id: true,
            token: true,
            role: true,
            expiresAt: true,
            project: {
                select: { id: true, name: true },
            },
            invitedBy: {
                select: { name: true, image: true },
            },
        },
    });

    return NextResponse.json({ invitations }, { status: 200 });
}
