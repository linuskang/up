import { NextRequest } from "next/server"
import { prisma } from "@/server/db"
import { ApiResponse } from "@/app/api/responses"
import { Project } from "@/server/project"
import { Api } from "@/server/api"

export async function GET(
  req: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  const { id } = await params

  const apiKey = req.headers.get("x-api-key")

  if (!apiKey) {
    return ApiResponse.BadRequest("API key is required")
  }

  const validate = await Api.validateKey(apiKey)

  if (!validate.valid || validate.projectId !== id) {
    return ApiResponse.Unauthorized()
  }

  const project = await Project.get(id)

  if (!project) {
    return ApiResponse.NotFound("Project not found")
  }

  const search = new URL(req.url)

  const page = Math.max(
    Number(search.searchParams.get("page") ?? 1),
    1
  )

  const limit = Math.min(
    Math.max(Number(search.searchParams.get("limit") ?? 50), 1),
    100
  )

  const skip = (page - 1) * limit

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: {
        projectId: id,
        OR: [
          {
            contextStart: true,
          },
          {
            contextId: null,
          },
        ],
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: limit,
    }),

    prisma.event.count({
      where: {
        projectId: id,
        OR: [
          {
            contextStart: true,
          },
          {
            contextId: null,
          },
        ],
      },
    }),
  ])

  const contextIds = events
    .filter((event) => event.contextId)
    .map((event) => event.contextId!)

  const contextEvents = contextIds.length
    ? await prisma.event.findMany({
      where: {
        projectId: id,
        contextId: {
          in: contextIds,
        },
        contextStart: false,
      },
      orderBy: {
        createdAt: "asc",
      },
    })
    : []

  const formatted = events.map((event) => ({
    ...event,
    events: event.contextId
      ? contextEvents.filter(
        (child) => child.contextId === event.contextId
      )
      : undefined,
  }))

  return ApiResponse.Success(undefined, {
    events: formatted,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  })
}