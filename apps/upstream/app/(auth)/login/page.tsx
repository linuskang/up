"use client"

// Libraries
import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/client/auth"

// Components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
    FieldSeparator,
} from "@/components/ui/field"
import { Github, Google } from "@/components/icons"

export default function Page() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)
    const [needsVerification, setNeedsVerification] = useState(false)
    const [resendLoading, setResendLoading] = useState(false)
    const [resendSent, setResendSent] = useState(false)

    const login = async (form: React.FormEvent<HTMLFormElement>) => {
        form.preventDefault()
        setError(null)
        setNeedsVerification(false)
        setResendSent(false)
        setLoading(true)

        const { error } = await authClient.signIn.email({
            email,
            password,
            callbackURL: "/",
        })

        if (error) {
            if (error.code === "EMAIL_NOT_VERIFIED") {
                setNeedsVerification(true)
            } else {
                setError(error.message || "An error occurred")
            }
            setLoading(false)
            return
        }

        setLoading(false)
    }

    const resendVerification = async () => {
        setResendLoading(true)
        setResendSent(false)
        setError(null)

        const { error } = await authClient.sendVerificationEmail({
            email,
            callbackURL: "/",
        })

        if (error) {
            setError(error.message || "An error occurred")
            setResendLoading(false)
            return
        }

        setResendSent(true)
        setResendLoading(false)
    }

    const github = async () => {
        setError(null)
        setLoading(true)

        await authClient.signIn.social({
            provider: "github",
        })
    }

    const google = async () => {
        setError(null)
        setLoading(true)

        await authClient.signIn.social({
            provider: "google",
        })
    }

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
            <Card className="w-full bg-background ring-0 sm:w-auto">
                <CardHeader className="gap-2 pb-2 text-center">
                    <CardTitle className="text-5xl font-bold">
                        Upstream
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form
                        className="flex flex-col gap-5 sm:min-w-90"
                        onSubmit={login}
                    >
                        <Field>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={github}
                                disabled={loading}
                                className="h-10 w-full cursor-pointer justify-center gap-2 border-none text-sm"
                            >
                                <Github />
                                Continue with GitHub
                            </Button>
                            <Button
                                variant="outline"
                                type="button"
                                onClick={google}
                                disabled={loading}
                                className="h-10 w-full cursor-pointer justify-center gap-2 border-none text-sm"
                            >
                                <Google />
                                Continue with Google
                            </Button>
                        </Field>
                        <FieldSeparator className="text-sm">
                            Or continue with
                        </FieldSeparator>
                        <Field className="-mt-2">
                            <FieldGroup>
                                <FieldLabel className="text-sm">
                                    Account Email
                                </FieldLabel>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                    placeholder="your@email.com"
                                    className="-mt-3 h-10 border-0 !text-sm text-xl"
                                />
                            </FieldGroup>
                        </Field>
                        <Field className="-mt-2">
                            <FieldGroup>
                                <FieldLabel className="text-sm">
                                    Your Password
                                </FieldLabel>
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    autoComplete="current-password"
                                    required
                                    placeholder="Enter your password"
                                    className="-mt-3 h-10 border-0 !text-sm text-base"
                                />
                            </FieldGroup>
                            <FieldDescription className="flex text-sm">
                                Forgot your password?{" "}
                                <Link
                                    href="/forgot-password"
                                    className="underline-none ml-1 font-bold !no-underline transition hover:text-white"
                                >
                                    Reset password
                                </Link>
                            </FieldDescription>
                        </Field>
                        <Field>
                            <Button
                                type="submit"
                                disabled={loading}
                                className="h-10 w-full cursor-pointer text-sm font-bold"
                            >
                                {loading ? "Logging in..." : "Login"}
                            </Button>

                            {error && (
                                <div className="flex justify-center rounded-lg text-sm text-destructive">
                                    {error}
                                </div>
                            )}
                        </Field>

                        {needsVerification && (
                            <div className="flex max-w-sm flex-col gap-3 rounded-lg bg-card p-4">
                                <div className="flex flex-col gap-1">
                                    <p className="text-sm font-medium">
                                        Email not verified
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Please check your inbox for a
                                        verification link. If you need a new
                                        one, click the button below.
                                    </p>
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={resendLoading || resendSent}
                                    onClick={resendVerification}
                                    className="h-9 w-full cursor-pointer border-none text-sm font-bold"
                                >
                                    {resendSent
                                        ? "Email sent!"
                                        : resendLoading
                                          ? "Sending..."
                                          : "Resend verification email"}
                                </Button>
                                {resendSent && (
                                    <p className="text-center text-xs text-green-600">
                                        Check your inbox for the verification
                                        link.
                                    </p>
                                )}
                            </div>
                        )}

                        <FieldDescription className="flex justify-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/register"
                                className="underline-none ml-1 font-bold !no-underline transition hover:text-white"
                            >
                                Create an account
                            </Link>
                        </FieldDescription>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
