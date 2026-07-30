import { prisma } from '@/server/db'

export class User {
  static async get(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    })

    return user
  }
}