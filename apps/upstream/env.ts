import { createEnv } from "@t3-oss/env-core"
import * as z from "zod"

export const env = createEnv({
    server: {
        DATABASE_URL: z.url(),

        BETTER_AUTH_SECRET: z.string(),
        BETTER_AUTH_URL: z.url(),

        GITHUB_CLIENT_ID: z.string(),
        GITHUB_CLIENT_SECRET: z.string(),

        GOOGLE_CLIENT_ID: z.string(),
        GOOGLE_CLIENT_SECRET: z.string(),

        ALLOW_SIGNUP: z
            .enum(["true", "false"])
            .default("false")
            .transform((value) => value === "true"),

        RESEND_API_KEY: z.string(),
        RESEND_EMAIL_FROM: z.string(),

        CRON_SECRET: z.string().optional(),
    },

    clientPrefix: "PUBLIC_",
    client: {},

    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
    skipValidation:
        !!process.env.CI || process.env.SKIP_ENV_VALIDATION === "true",
})
