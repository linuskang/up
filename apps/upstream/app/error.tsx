"use client";

import { useEffect } from "react";
import { Button } from "@workspace/ui/components/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-white px-4">
            <div className="text-center space-y-4 max-w-md">
                <p className="text-5xl font-bold text-white/10 select-none">Oops</p>
                <h1 className="text-2xl font-semibold -mt-2">Something went wrong</h1>
                <p className="text-sm text-eventcontent/65">
                    An unexpected error occurred. If this keeps happening, please contact support.
                </p>
                {error.digest && (
                    <p className="text-xs font-mono text-eventcontent/40">
                        Error ID: {error.digest}
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
