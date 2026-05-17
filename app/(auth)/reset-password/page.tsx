"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";

import { authClient } from "@/client/auth";

function ResetPasswordContent() {
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleResetPassword = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setError(null);

        if (!token) {
            setError("This reset link is invalid or has expired.");
            return;
        }

        if (password.length < 8) {
            setError("Your new password must be at least 8 characters.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsLoading(true);

        const { error } = await authClient.resetPassword({
            newPassword: password,
            token,
        });

        if (error) {
            setError(error.message ?? "This reset link is invalid or has expired.");
            setIsLoading(false);
            return;
        }

        setIsSuccess(true);
        setIsLoading(false);
    };

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
            <Card className="w-full max-w-md bg-background ring-0">
                <CardHeader className="gap-2 pb-2 text-center">
                    <CardTitle className="text-4xl font-bold">Reset Password</CardTitle>
                </CardHeader>
                <CardContent>
                    {isSuccess ? (
                        <div className="flex flex-col gap-3 text-center text-sm">
                            <p>Your password has been reset successfully.</p>
                            <Link href="/login" className="font-semibold text-primary hover:underline">
                                Back to login
                            </Link>
                        </div>
                    ) : (
                        <form className="flex w-full flex-col gap-4" onSubmit={handleResetPassword}>
                            <Field>
                                <FieldGroup>
                                    <FieldLabel>New Password</FieldLabel>
                                    <Input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                        placeholder="Enter new password"
                                        className="h-10"
                                    />
                                </FieldGroup>
                                <FieldDescription>Use at least 8 characters.</FieldDescription>
                            </Field>
                            <Field>
                                <FieldGroup>
                                    <FieldLabel>Confirm Password</FieldLabel>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        autoComplete="new-password"
                                        required
                                        placeholder="Confirm new password"
                                        className="h-10"
                                    />
                                </FieldGroup>
                            </Field>

                            <Button type="submit" disabled={isLoading || !token} className="h-10 w-full cursor-pointer font-bold">
                                {isLoading ? "Resetting..." : "Reset password"}
                            </Button>

                            {error && <div className="rounded-lg text-sm text-destructive">{error}</div>}
                            {!token && <div className="rounded-lg text-sm text-destructive">This reset link is invalid or missing a token.</div>}
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function ResetPasswordFallback() {
    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
            <Card className="w-full max-w-md bg-background ring-0">
                <CardHeader className="gap-2 pb-2 text-center">
                    <CardTitle className="text-4xl font-bold">Reset Password</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-center text-sm">Loading reset link...</div>
                </CardContent>
            </Card>
        </div>
    );
}

export default function ResetPassword() {
    return (
        <Suspense fallback={<ResetPasswordFallback />}>
            <ResetPasswordContent />
        </Suspense>
    );
}
