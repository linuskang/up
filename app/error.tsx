'use client';

import { useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const errorId = useMemo(
        () => error.digest ?? crypto.randomUUID().slice(0, 8).toUpperCase(),
        [error]
    );

    useEffect(() => {
        console.error(`Error ID: ${errorId}`, error);
    }, [error, errorId]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-white px-4">
            <div className="text-center space-y-4 max-w-md">
                <p className="text-5xl font-bold text-white select-none">Oops</p>
                <h1 className="text-2xl font-semibold -mt-2">Something went wrong</h1>
                <p className="text-sm text-eventcontent/65">
                    An unexpected error occurred. If this keeps happening, please contact support.
                </p>

                <p className="text-xs font-mono text-eventcontent/40">
                    Error ID: {errorId}
                </p>

                {process.env.NODE_ENV === 'development' && (
                    <p className="text-xs font-mono text-red-400 break-all">
                        {error.message}
                    </p>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                    <Button onClick={reset}>Try Again</Button>
                    <Button variant="secondary" asChild>
                        <a href="/">Go to Dashboard</a>
                    </Button>
                </div>
            </div>
        </div>
    );
}