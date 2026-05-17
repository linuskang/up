import db from "@/server/prisma";
import { auth } from "@/server/auth";

import { NextRequest, NextResponse } from "next/server";

// Fetches user account data.
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

// Modify account profile.
export async function PATCH(request: NextRequest) {
    const session = await auth.api.getSession(request);

    if (!session) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const { name, email, image } = await request.json();

    if (typeof name !== "string" || typeof email !== "string") {
        return NextResponse.json(
            { error: "Name and email are required" },
            { status: 400 }
        );
    }

    const updatedUser = await db.user.update({
        where: { id: session.user.id },
        data: {
            name,
            email,
            image: typeof image === "string" ? image : null,
        },
    });

    return NextResponse.json(
        { success: true, user: updatedUser },
        { status: 200 }
    );
}
