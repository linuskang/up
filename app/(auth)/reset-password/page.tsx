'use client';

// Libraries
import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/client/auth';

// Components
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Field,
    FieldGroup,
    FieldLabel,
} from '@/components/ui/field';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const token = searchParams.get('token');

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (form: React.FormEvent<HTMLFormElement>) => {
        form.preventDefault();
        setError(null);
        setSuccess(false);

        if (!token) {
            setError('Invalid or missing reset token. Please request a new password reset link.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setLoading(true);

        const { error } = await authClient.resetPassword(
            {
                newPassword,
                token,
            }
        );

        if (error) {
            setError(error.message || 'An error occurred');
            setLoading(false);
            return;
        }

        setSuccess(true);
        setLoading(false);
    }

    return (
        <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
            <Card className="bg-background ring-0">
                <CardHeader className="gap-2 pb-2 text-center">
                    <CardTitle className="text-5xl font-bold">Upstream</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="flex flex-col gap-5 min-w-90" onSubmit={handleSubmit}>
                        <Field>
                            <FieldGroup>
                                <FieldLabel className="text-sm">New Password</FieldLabel>
                                <Input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    placeholder="Enter new password"
                                    className="h-10 text-base -mt-3 border-0 !text-sm"
                                />
                            </FieldGroup>
                        </Field>
                        <Field className="-mt-2">
                            <FieldGroup>
                                <FieldLabel className="text-sm">Confirm Password</FieldLabel>
                                <Input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    autoComplete="new-password"
                                    required
                                    placeholder="Confirm new password"
                                    className="h-10 text-base -mt-3 border-0 !text-sm"
                                />
                            </FieldGroup>
                        </Field>
                        <Field>
                            <Button type="submit" disabled={loading || !token} className="h-10 text-sm w-full cursor-pointer font-bold">
                                {loading ? "Resetting..." : "Reset password"}
                            </Button>

                            {error && (
                                <div className="flex justify-center rounded-lg text-sm text-destructive">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex flex-col items-center gap-2 text-sm">
                                    <span className="text-green-600">Password reset successfully!</span>
                                    <Link href="/login" className="font-bold underline-none transition hover:text-white !no-underline">
                                        Go to login
                                    </Link>
                                </div>
                            )}
                        </Field>
                        <div className="flex text-sm justify-center">
                            <Link href="/login" className="font-bold ml-1 underline-none transition hover:text-white !no-underline">
                                Back to login
                            </Link>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}

export default function Page() {
    return (
        <Suspense fallback={
            <div className="relative flex min-h-svh items-center justify-center overflow-hidden bg-background px-4 py-10 sm:px-6">
                <div>Loading...</div>
            </div>
        }>
            <ResetPasswordForm />
        </Suspense>
    )
}
