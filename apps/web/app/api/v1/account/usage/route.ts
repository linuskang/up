import { getSession } from "@/server/auth"
import { Usage } from "@/server/usage"
import { ApiResponse } from "@/app/api/responses"

export async function GET() {
  const session = await getSession()

  if (!session) {
    return ApiResponse.Unauthorized()
  }

  const stats = await Usage.getStats(session.user.id)

  return ApiResponse.Success(undefined, stats)
}
