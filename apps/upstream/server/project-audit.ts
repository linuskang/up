import { Prisma } from "@prisma/client";
import db from "@/server/prisma";

export type ProjectAuditAction =
    | "project.created"
    | "project.renamed"
    | "member.invited"
    | "member.role_updated"
    | "member.removed"
    | "member.left"
    | "api_key.created"
    | "api_key.regenerated"
    | "api_key.revoked";

type CreateProjectAuditLogInput = {
    projectId: string;
    actorUserId: string | null;
    action: ProjectAuditAction;
    title: string;
    description?: string | null;
    metadata?: Record<string, unknown> | null;
};

export async function createProjectAuditLog(input: CreateProjectAuditLogInput) {
    return db.projectAuditLog.create({
        data: {
            projectId: input.projectId,
            actorUserId: input.actorUserId,
            action: input.action,
            title: input.title,
            description: input.description ?? null,
            metadata: (input.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
        },
    });
}
