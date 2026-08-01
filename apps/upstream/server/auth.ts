import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { env } from "@/env";
import { Resend } from "resend";

const resend = new Resend(env.RESEND_API_KEY);

const adapter = new PrismaPg(
    {
        connectionString: process.env.DATABASE_URL!,
    }
);

const client = new PrismaClient(
    {
        adapter
    }
);

export const auth = betterAuth(
    {
        database: prismaAdapter(client, { provider: "postgresql" }),

        appname: "Upstream",
        baseURL: env.BETTER_AUTH_URL,

        databaseHooks: {
            user: {
                create: {
                    after: async (user) => {
                        await resend.emails.send({
                            from: env.RESEND_EMAIL_FROM,
                            to: user.email,
                            subject: "[Upstream] Welcome to Upstream!",
                            text: `Hello, ${user.name}. Welcome to Upstream!`,
                        });
                    },
                },
            },
        },

        user: {
            additionalFields: {
                accountPlan: {
                    type: "string",
                    defaultValue: "Hobby",
                },
            }
        },

        emailAndPassword: {
            enabled: true,
            sendResetPassword: async ({ user, url, token }, request) => {
                const resetPasswordUrl = `${env.BETTER_AUTH_URL}/reset-password?token=${encodeURIComponent(token)}`;

                await resend.emails.send(
                    {
                        from: env.RESEND_EMAIL_FROM,
                        to: user.email,
                        subject: "[Upstream] Reset your password",
                        text: `Click the link to reset your password: ${resetPasswordUrl}`,
                    }
                )
            },
            onPasswordReset: async ({ user }, request) => {
                await resend.emails.send(
                    {
                        from: env.RESEND_EMAIL_FROM,
                        to: user.email,
                        subject: "[Upstream] Your password has been reset",
                        text: `Hello, ${user.name}. Your password has been reset. If you did not perform this action, please contact our support immediately.`,
                    }
                )
            },
        },

        emailVerification: {
            sendVerificationEmail: async ({ user, url, token }, request) => {
                await resend.emails.send(
                    {
                        from: env.RESEND_EMAIL_FROM,
                        to: user.email,
                        subject: "[Upstream] Verify your email address",
                        text: `Click the link to verify your email: ${url}`,
                    }
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
            }
        },
    }
);
