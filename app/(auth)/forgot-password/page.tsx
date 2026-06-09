'use client';

// Libraries
import { useState } from 'react';
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

export default function Page() {
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (form: React.FormEvent<HTMLFormElement>) => {
        form.preventDefault();
        setError(null);
        setSuccess(false);
        setLoading(true);

        const { error } = await authClient.requestPasswordReset(
            {
                email,
                redirectTo: '/reset-password',
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
                                <FieldLabel className="text-sm">Account Email</FieldLabel>
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    required
                                    placeholder="your@email.com"
                                    className="h-10 text-xl -mt-3 border-0 !text-sm"
                                />
                            </FieldGroup>
                        </Field>
                        <Field>
                            <Button type="submit" disabled={loading} className="h-10 text-sm w-full cursor-pointer font-bold">
                                {loading ? "Sending..." : "Send reset link"}
                            </Button>

                            {error && (
                                <div className="flex justify-center rounded-lg text-sm text-destructive">
                                    {error}
                                </div>
                            )}
                            {success && (
                                <div className="flex justify-center rounded-lg text-sm text-green-600">
                                    If this email is registered, a reset link has been sent!
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
