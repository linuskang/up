'use client';

// Libraries
import { useState } from 'react';
import { authClient } from '@/client/auth';
import { redirect } from 'next/navigation';

// Components
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    const { data: session, isPending } = authClient.useSession();
    const [resendLoading, setResendLoading] = useState(false);
    const [resendSent, setResendSent] = useState(false);
    const [resendError, setResendError] = useState<string | null>(null);

    if (isPending) {
        return (
            <div className="flex min-h-svh items-center justify-center p-6">
                <div>Loading...</div>
            </div>
        );
    }

    if (!session) {
        redirect('/login');
    }

    const resendVerification = async () => {
        setResendLoading(true);
        setResendSent(false);
        setResendError(null);

        const { error } = await authClient.sendVerificationEmail(
            {
                email: session.user.email,
                callbackURL: '/',
            }
        );

        if (error) {
            setResendError(error.message || 'An error occurred');
            setResendLoading(false);
            return;
        }

        setResendSent(true);
        setResendLoading(false);
    };

    // Unverified state — gate all pages under (root)
    if (!session.user.emailVerified) {
        return (
            <div className="flex min-h-svh items-center justify-center p-6">
                <Card className="bg-background ring-1 ring-foreground/10 max-w-md w-full">
                    <CardHeader className="pb-2 text-center gap-2">
                        <CardTitle className="text-2xl font-bold">Verify your email</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                        <div className="flex flex-col gap-2 text-center">
                            <p className="text-sm text-muted-foreground">
                                You need to verify your email address before you can use Upstream.
                            </p>
                            <p className="text-sm text-muted-foreground">
                                We sent a verification link to <strong className="text-foreground">{session.user.email}</strong>. Please check your inbox.
                            </p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <Button
                                onClick={resendVerification}
                                disabled={resendLoading || resendSent}
                                className="h-10 text-sm w-full cursor-pointer font-bold"
                            >
                                {resendSent ? "Email sent!" : (resendLoading ? "Sending..." : "Resend verification email")}
                            </Button>

                            {resendSent && (
                                <p className="text-center text-sm text-green-600">
                                    Check your inbox for the verification link.
                                </p>
                            )}
                            {resendError && (
                                <p className="text-center text-sm text-destructive">
                                    {resendError}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-center gap-2">
                            <Button onClick={() => {
                                authClient.signOut();
                            }} variant="outline" className="h-9 text-sm border-none">
                                Sign out
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <>{children}</>;
}
