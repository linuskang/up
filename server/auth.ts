import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { env } from "@/env";
import { Resend } from "resend";
import { render } from "@react-email/render";
import { ResetPasswordEmail } from "@/emails/reset-password-email";
import { VerificationEmail } from "@/emails/verification-email";

const resend = new Resend(env.RESEND_API_KEY);

export const auth = betterAuth(
    {
        database: prismaAdapter(prisma,
            {
                provider: "postgresql"
            }
        ),
        baseURL: env.BETTER_AUTH_URL,
        databaseHooks: {
            user: {
                create: {
                    before: async (user) => {
                        if (!user.image && user.name) {
                            const seed = encodeURIComponent(user.name);
                            return {
                                data: {
                                    ...user,
                                    image: `https://api.dicebear.com/9.x/glass/svg?seed=${seed}`,
                                },
                            };
                        }
                    },
                },
            },
        },
        emailVerification: {
            sendOnSignUp: true,
            sendOnSignIn: false,
            sendVerificationEmail: async (data) => {
                const html = await render(
                    VerificationEmail({
                        userName: data.user.name,
                        verificationUrl: data.url,
                    }),
                    { pretty: true }
                );

                await resend.emails.send({
                    from: env.RESEND_EMAIL_FROM,
                    to: data.user.email,
                    subject: "Verify your email",
                    html,
                });
            },
        },
        emailAndPassword: {
            enabled: true,
            requireEmailVerification: true,
            sendResetPassword: async (data) => {
                const html = await render(
                    ResetPasswordEmail({
                        userName: data.user.name,
                        resetUrl: data.url,
                    }),
                    { pretty: true }
                );

                await resend.emails.send({
                    from: env.RESEND_EMAIL_FROM,
                    to: data.user.email,
                    subject: "Reset your password",
                    html,
                });
            },
        },
        socialProviders: {
            github: {
                clientId: env.GITHUB_CLIENT_ID,
                clientSecret: env.GITHUB_CLIENT_SECRET,
            },
        },
    }
);
