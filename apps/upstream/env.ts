import { createEnv } from "@t3-oss/env-core";
import * as z from "zod";

export const env = createEnv(
    {
        server: {
            DATABASE_URL: z.string().url(),
            BETTER_AUTH_URL: z.string().url(),
            GITHUB_CLIENT_ID: z.string(),
            GITHUB_CLIENT_SECRET: z.string(),
            GOOGLE_CLIENT_ID: z.string(),
            GOOGLE_CLIENT_SECRET: z.string(),
            RESEND_API_KEY: z.string(),
            RESEND_EMAIL_FROM: z.string().email(),
            VERSION: z.string(),
        },

        clientPrefix: "PUBLIC_",
        client: {

        },

        runtimeEnv: process.env,
        emptyStringAsUndefined: true,
    }
);
