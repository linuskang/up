"use client";

import { authClient } from "@/client/auth";
import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [sent, setSent] = useState(false);

    const handleRequestReset = async () => {
        const { data, error } = await authClient.requestPasswordReset({
            email: email,
        });

        if (error) {
            setError(error.message || "An error occurred, please try again later :>");
        } else {
            setSent(true);
        }
    };

    return (
        <div className="flex min-h-svh p-6 items-center justify-center">
            <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
                <div>
                    <h1 className="font-bold text-2xl">Forgot your password?</h1>
                    <p>Enter your email address below and we will send you a link to reset your password.</p>
                </div>
                <div className="flex flex-col gap-2">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full rounded-md bg-card px-3 py-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <button
                        onClick={handleRequestReset}
                        disabled={!email}
                        className="w-full rounded-md bg-primary px-3 py-2 text-white hover:bg-primary/90 disabled:bg-primary/50 disabled:cursor-not-allowed"
                    >
                        Send reset link
                    </button>
                    {error && <div className="text-sm text-destructive">{error}</div>}
                    {sent && <div className="text-sm">If an account with that email exists, a reset link has been sent.</div>}
                </div>
            </div>
        </div>
    )
}
