import { RotatingEvents } from "@/components/homepage/rotating-events"
import { Navbar } from "@/components/homepage/navbar"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <section className="relative flex flex-col items-center justify-center px-4 pt-32 pb-20 text-center">
                <div className="mx-auto max-w-2xl space-y-6">
                    <h1 className="text-4xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl">
                        Simple and open logging for your next project.
                    </h1>

                    <p className="mx-auto max-w-lg text-base text-muted-foreground">
                        Upstream is a simple logging platform for developers. View your events in a beautifully designed dashboard with powerful searching capabilities.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-3">
                        <Button size="lg" className="gap-2 text-sm font-semibold">
                            <Link href="/register">Create a free account</Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="gap-2 text-sm font-semibold"
                        >
                            <Link href="/docs">View the docs</Link>
                        </Button>
                    </div>
                </div>

                <div className="mx-auto mt-12">
                    <RotatingEvents />
                </div>
            </section>

            {/* <section className="flex flex-col items-center px-4 py-0 text-center">
                <div className="mx-auto max-w-2xl space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Houston we have a problem..
                    </h2>
                    <p className="mx-auto max-w-lg text-base text-muted-foreground">
                        Every day, hundreds of developers are sending notifications on platforms for their most critical events.
                    </p>
                </div>

            </section> */}
        </div>
    )
}