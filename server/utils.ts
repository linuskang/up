

import { prisma } from '@/server/prisma';
import crypto from 'crypto';

export class Api {
    static async validateKey(apiKey: string): Promise<boolean> {
        return false
    }

}

export class Project {
    static async get(
        projectId: string
    ) {
        const project = await prisma.project.findUnique(
            {
                where: {
                    id: projectId,
                },
                include: {
                    apiKeys: true,
                }
            }
        )
        return project;
    }

    static async delete(
        projectId: string
    ) {
        await prisma.project.delete(
            {
                where: {
                    id: projectId,
                }
            }
        )
        return true;
    }

    static async create(
        ownerId: string,
        name: string
    ) {
        const newProject = await prisma.project.create(
            {
                data: {
                    name,
                    ownerId,
                }
            }
        )

        return newProject;
    }

    static async addApiKey(
        projectId: string,
        addedById: string,
        name: string
    ) {
        const apiKey = 'up_' + crypto.randomUUID().replace(/-/g, '');
        const hash = crypto.createHash('sha256')
                    .update(apiKey)
                    .digest('hex');

        await prisma.apiKey.create(
            {
                data: {
                    name,
                    key: hash,
                    addedById,
                    projectId,
                }
            }
        )

        return apiKey;
    }

    static async deleteApiKey(
        apiKeyId: string
    ) {
        await prisma.apiKey.delete(
            {
                where: {
                    id: apiKeyId,
                }
            }
        )

        return true;
    }
}