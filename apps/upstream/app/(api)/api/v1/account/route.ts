import db from "@/server/prisma";
import { auth } from "@/server/auth";

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const user = await db.user.findUnique({
        where: { id: session.user.id },
    });

    return NextResponse.json(
        { user },
        { status: 200 }
    );
}
