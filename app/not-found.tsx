import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"

export default function NotFound() {
    return (
        <div className="flex min-h-svh items-center justify-center px-4 py-10">
            <Card className="bg-background ring-1 p-10 max-w-md w-full text-center">
                <CardHeader className="gap-2 pb-2">
                    <CardTitle className="text-7xl font-bold">404</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <p className="text-lg font-medium">Page not found</p>
                        <p className="text-sm text-muted-foreground">
                            The page you are looking for does not exist or has been moved.
                        </p>
                    </div>
                    <Link href="/">
                        <Button className="h-10 text-sm w-full cursor-pointer font-bold gap-2">
                            Back to home
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    )
}
