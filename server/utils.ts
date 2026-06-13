import { prisma } from "@/server/prisma"
import crypto from "crypto"

export class Api {
    static async validateKey(apiKey: string): Promise<{ valid: boolean; projectId?: string }> {
        if (!apiKey.startsWith("up_")) {
            return { valid: false }
        }

        const hash = crypto.createHash("sha256").update(apiKey).digest("hex")

        const key = await prisma.apiKey.findUnique({
            where: {
                key: hash,
            },
        })

        if (!key || !key.active) {
            return { valid: false }
        }

        await prisma.apiKey.update({
            where: {
                id: key.id,
            },
            data: {
                lastUsed: new Date(),
            },
        })

        return { valid: true, projectId: key.projectId }
    }
}

export class Project {
    static async delete(projectId: string) {
        await prisma.project.delete({
            where: {
                id: projectId,
            },
        })
        return true
    }

    static async create(ownerId: string, name: string) {
        const newProject = await prisma.project.create({
            data: {
                name,
                ownerId,
            },
        })

        return newProject
    }

    static async rename(projectId: string, name: string) {
        await prisma.project.update({
            where: {
                id: projectId,
            },
            data: {
                name,
            },
        })
        return true
    }

    static async addApiKey(projectId: string, addedById: string, name: string) {
        const apiKey = "up_" + crypto.randomUUID().replace(/-/g, "")
        const hash = crypto.createHash("sha256").update(apiKey).digest("hex")

        // TODO: add hint to api key that records first 4 characters
        // e.g. "up_jt83..."

        await prisma.apiKey.create({
            data: {
                name,
                key: hash,
                addedById,
                projectId,
            },
        })

        return apiKey
    }
}