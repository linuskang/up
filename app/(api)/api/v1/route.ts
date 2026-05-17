import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { env } from "@/env";

export async function GET(request: NextRequest) {
    const user = await auth.api.getSession(request);
    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(
        {
            version: env.VERSION,
        }
    );
}
