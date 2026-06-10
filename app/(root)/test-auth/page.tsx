'use client';

// Libraries
import { authClient } from '@/client/auth';

import { Button } from "@/components/ui/button"
import Link from 'next/link';

export default function Page() {
    const { data: session } = authClient.useSession();

    return (
        <div className="flex min-h-svh p-6">
            <div className="flex max-w-md min-w-0 flex-col gap-4 text-sm leading-loose">
                <div>
                    <h1 className="font-medium">Welcome, {session?.user.name}</h1>
                    <p>Your email: {session?.user.email}</p>
                    <p>This is a demo session page to check if your signed in!</p>
                    <div className="flex gap-2 mt-2">
                        <Button onClick={() => {
                            authClient.signOut();
                        }}>
                            Sign out
                        </Button>
                        <Link href="/settings">
                            <Button variant="outline">
                                Settings
                            </Button>
                        </Link>
                    </div>
                </div>
                <div className="font-mono text-xs text-muted-foreground">
                    (Press <kbd>d</kbd> to toggle dark mode)
                </div>
            </div>
        </div>
    )
}
