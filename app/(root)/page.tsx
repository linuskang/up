'use client';

// Libraries
import { authClient } from '@/client/auth';
import { redirect } from 'next/navigation';

import { Button } from "@/components/ui/button"

export default function Page() {

    const { data: session, isPending} = authClient.useSession();

    if (isPending) {
        return <div>Loading...</div>
    }

    if (!session) {
        redirect('/login');
    }
    return (
        <div className="flex min-h-svh p-6">
            <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
                <div>
                    <h1 className="font-medium">Welcome, {session.user.name}</h1>
                    <p>Your email: {session.user.email}</p>
                    <p>This is a demo session page to check if your signed in!</p>
                    <Button onClick={() => {
                        authClient.signOut();
                    }} className="mt-2">
                        Sign out
                    </Button>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                    (Press <kbd>d</kbd> to toggle dark mode)
                </div>
            </div>
        </div>
    )
}
