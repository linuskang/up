import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/server/auth"
import { Usage } from "@/server/utils"

export async function GET(request: NextRequest) {
    const session = await auth.api.getSession({
        headers: request.headers,
    })

    if (!session) {
        return NextResponse.json(
            {
                error: "Unauthorized",
            },
            {
                status: 401,
            }
        )
    }

    const stats = await Usage.getStats(session.user.id)

    return NextResponse.json(stats, { status: 200 })
}
