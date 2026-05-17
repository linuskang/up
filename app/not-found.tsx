import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-background text-white px-4">
            <div className="text-center space-y-4 max-w-md">
                <p className="text-7xl font-bold text-white/10 select-none">404</p>
                <h1 className="text-2xl font-semibold -mt-2">Page not found</h1>
                <p className="text-sm text-eventcontent/65">
                    The page you&apos;re looking for doesn&apos;t exist or has been moved.
                </p>
                <div className="flex items-center justify-center gap-3 pt-2">
                    <Button asChild>
                        <Link href="/">Go to Dashboard</Link>
                    </Button>
                    <Button asChild variant="secondary">
                        <Link href="/settings">Settings</Link>
                    </Button>
                </div>
            </div>
        </div>
    );
}
