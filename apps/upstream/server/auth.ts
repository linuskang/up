import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import { prisma } from "./prisma"
import { env } from "@/env"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { Email } from "./resend"

export async function getSession() {
    return auth.api.getSession({
        headers: await headers(),
    });
}

export async function requireSession() {
    const session = await auth.api.getSession({
        headers: await headers()
    });

    if (!session) {
        redirect("/auth/login");
    }
    return session;
}

export const auth = betterAuth({
    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),

    baseURL: env.BETTER_AUTH_URL,

    databaseHooks: {
        user: {
            create: {
                before: async (user) => {
                    if (!env.ALLOW_SIGNUP) {
                        throw new Error(
                            "Signups are currently disabled. Please contact the administrator."
                        )
                    }

                    if (!user.image && user.name) {
                        const seed = encodeURIComponent(user.name)
                        return {
                            data: {
                                ...user,
                                image: `https://avatars.linus.my/10.x/glass/svg?seed=${seed}`,
                            },
                        }
                    }
                },
            },
        },
    },

    emailVerification: {
        sendOnSignUp: true,
        sendOnSignIn: false,
        sendVerificationEmail: async (data) => {
            await Email.send(
                data.user.email,
                "Upstream - Verify your email",
                `Please verify your email by clicking the following link: ${data.url}`
            )
        },
    },

    emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        sendResetPassword: async (data) => {
            await Email.send(
                data.user.email,
                "Upstream - Reset your password",
                `Reset your password by clicking the following link: ${data.url}`
            )
        },
    },

    socialProviders: {
        github: {
            clientId: env.GITHUB_CLIENT_ID,
            clientSecret: env.GITHUB_CLIENT_SECRET,
        },
        google: {
            clientId: env.GOOGLE_CLIENT_ID,
            clientSecret: env.GOOGLE_CLIENT_SECRET,
        },
    },
})
