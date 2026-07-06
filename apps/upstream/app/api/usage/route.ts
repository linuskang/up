import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/server/auth"
import { Usage } from "@/server/utils"

export async function GET(_request: NextRequest) {
    const session = await getSession()

    if (!session) {
        return NextResponse.json(
            "Unauthorized",
            {
                status: 401,
            }
        )
    }

    const stats = await Usage.getStats(session.user.id)

    return NextResponse.json(stats, { status: 200 })
}
