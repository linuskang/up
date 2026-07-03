"use client"

import Link from "next/link"

import { RotatingEvents } from "@/components/homepage/rotating-events"
import { Navbar } from "@/components/homepage/navbar"
import { ShakingCards } from "@/components/homepage/shaking-cards"
import { CodeBlock } from "@/components/homepage/code-block"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion"
import { Event } from "@/components/event"
import Image from "next/image"

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <section className="relative flex flex-col items-center justify-center px-4 pt-20 pb-16 text-center sm:pt-32 sm:pb-20">
                <div className="mx-auto w-full max-w-2xl space-y-6 px-2 sm:px-0">
                    <h1 className="text-3xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl">
                        Simple and open logging for your next project.
                    </h1>

                    <p className="mx-auto max-w-lg text-sm text-muted-foreground sm:text-base">
                        Upstream is a simple logging platform for developers. View your events in a beautifully designed dashboard with powerful searching capabilities.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button size="lg" className="w-full sm:w-auto gap-2 text-sm font-semibold">
                            <Link href="/register">Create a free account</Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-full sm:w-auto gap-2 text-sm font-semibold"
                        >
                            <Link href="/docs">View the docs</Link>
                        </Button>
                    </div>
                </div>

                <div className="mx-auto mt-8 w-full sm:mt-12">
                    <RotatingEvents />
                </div>
            </section>

            <section className="-mt-30 flex flex-col items-center px-4 py-16 text-center sm:py-24">
                <div className="mx-auto max-w-2xl space-y-4">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Houston we have a problem..
                    </h2>
                    <p className="mx-auto max-w-lg text-base text-muted-foreground">
                        Every day, hundreds of developers are sending notifications on messaging platforms for their most critical events.
                    </p>
                </div>

                <ShakingCards
                    className="mt-5"
                    cards={[
                        {
                            src: "/homepage/gmail.png",
                            alt: "Gmail notification overload",
                            label: "Email",
                        },
                        {
                            src: "/homepage/discord.png",
                            alt: "Discord notification overload",
                            label: "Discord",
                        },
                        {
                            src: "/homepage/whatsapp.png",
                            alt: "WhatsApp notification overload",
                            label: "WhatsApp",
                        },
                    ]}
                />

                <p className="mx-auto max-w-lg text-base text-muted-foreground mt-5">
                    In other words - a clunky workflow that doesn&apos;t scale well.
                </p>
            </section>

            <section className="-mt-30 flex flex-col items-center px-4 py-16 text-center sm:py-24">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Introducing Upstream
                </h2>
                <p className="mx-auto max-w-lg text-base text-muted-foreground mt-4">
                    A simple logging platform for developers. View your events in a beautifully designed dashboard with powerful searching capabilities. Integrate in minutes with our simple SDK and API.
                </p>

                <div className="mt-5 flex w-full max-w-lg flex-col gap-5">
                    <Card className="overflow-hidden rounded-xl bg-card ring-0 p-0 gap-0 md:min-h-[250px]">
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 flex-1 p-0 min-h-0">
                            <div className="relative h-64 w-full md:h-full">
                                <Image
                                    src="/homepage/feature-1.jpg"
                                    alt="Upstream dashboard screenshot"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex flex-col justify-center gap-3 p-5 md:p-6 text-left">
                                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                                    Run actions on events.
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Use actions to trigger product workflows in your event.
                                </p>

                                <Button variant="default" className="w-max">
                                    <Link href="/docs">Learn more</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-xl bg-card ring-0 p-0 gap-0 md:min-h-[250px]">
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 flex-1 p-0 min-h-0">
                            <div className="flex flex-col justify-center gap-3 p-5 md:p-6 text-left">
                                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                                    Critical events → Phone. Immediately.
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Get notified of critical events on your phone with our PWA app.
                                </p>

                                <Button variant="default" className="w-max">
                                    <Link href="/docs">Learn more</Link>
                                </Button>
                            </div>

                            <div className="relative h-64 w-full md:h-full md:order-last order-first">
                                <Image
                                    src="/homepage/feature-2.jpg"
                                    alt="Upstream search interface"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-xl bg-card ring-0 p-0 gap-0 md:min-h-[250px]">
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 flex-1 p-0 min-h-0">
                            <div className="relative h-64 w-full md:h-full">
                                <Image
                                    src="/homepage/feature-3.jpg"
                                    alt="Upstream dashboard screenshot"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>

                            <div className="flex flex-col justify-center gap-3 p-5 md:p-6 text-left">
                                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                                    Log complex events with contextIds.
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Use contexts to link events together and view them in the dashboard.
                                </p>

                                <Button variant="default" className="w-max">
                                    <Link href="/docs">Learn more</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="overflow-hidden rounded-xl bg-card ring-0 p-0 gap-0 md:min-h-[250px]">
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 flex-1 p-0 min-h-0">
                            <div className="flex flex-col justify-center gap-3 p-5 md:p-6 text-left">
                                <h3 className="text-lg font-semibold tracking-tight text-foreground">
                                    Log JSON with ease.
                                </h3>

                                <p className="text-sm text-muted-foreground">
                                    Have complex event data? No problem. Log it as JSON.
                                </p>
                            </div>

                            <div className="relative h-64 w-full md:h-full md:order-last order-first">
                                <Image
                                    src="/homepage/feature-4.jpg"
                                    alt="Upstream search interface"
                                    fill
                                    sizes="(max-width: 768px) 100vw, 50vw"
                                    className="object-cover"
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>

            <section className="-mt-30 flex flex-col items-center px-4 py-16 sm:py-24">
                <div className="mx-auto max-w-2xl space-y-4 text-center">
                    <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                        Integrate on a Friday
                    </h2>
                    <p className="mx-auto max-w-lg text-base text-muted-foreground">
                        Start sending events in literally minutes with our simple SDK.
                    </p>
                </div>

                <div className="mx-auto mt-5 w-full max-w-lg">
                    <CodeBlock
                        code={`import { Upstream } from 'upstream-sdk'

const up = new Upstream("YOUR_API_KEY")

up.events.ingest({
    title: "Project Deployed",
    icon: "😁",
});`}
                    />
                </div>

                <div className="my-4 flex justify-center">
                    <svg
                        className="h-8 w-8 text-muted-foreground "
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2}
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 5v14m0 0-5-5m5 5 5-5"
                        />
                    </svg>
                </div>

                <div className="w-full max-w-lg">
                    <Event
                        title="Project Deployed"
                        icon="😁"
                        createdAt={new Date().toISOString()}
                    />
                </div>
            </section>

            <section className="-mt-30 flex flex-col items-center px-4 py-16 sm:py-24">
                <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
                    Have any questions?
                </h2>

                <Accordion
                    type="single"
                    collapsible
                    className="max-w-lg border-none bg-card mt-5"
                >
                    <AccordionItem value="differences" className="border-none">
                        <AccordionTrigger className="text-base">What makes this different compared to others like Seq and Datadog?</AccordionTrigger>
                        <AccordionContent>
                            <div>
                                <p>
                                    Seq and Datadog are designed for the product analytics space. They ingest large volumes of events and provide powerful querying capabilities & statistics for your application.
                                </p>

                                <p className="mt-2">
                                    Upstream is designed for the critical logs/events space. We focus on delivering a beautiful, intuitive experience for viewing and querying your most important events on the fly. You can use Upstream for your product&apos;s audit logs, triggering workflows, and logging complex events.
                                </p>

                                <p className="mt-2">We have:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Arguably the best UI for querying events on the go, especially for mobile.</li>
                                    <li>Full API, easily ingest and query logs from your apps.</li>
                                    <li>Action buttons and contextIds are our main differentiators.</li>
                                    <li>Built for easy integration with your apps, no complex setup required.</li>
                                </ul>
                                <p className="mt-2">
                                    Upstream was built to easily view your most critical logs on the fly, with a expressive interface. If you don&apos;t need easy access to important logs, Upstream isn&apos;t for you.
                                </p>
                            </div>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="usage" className="border-none">
                        <AccordionTrigger className="text-base">Who is using Upstream?</AccordionTrigger>
                        <AccordionContent>
                            <p>
                                Because Upstream is still extremely new, we don&apos;t have any major public customers yet.
                            </p>
                            <p>
                                However, I&apos;ve personally been using it in production for the past couple months because I got tired of having to carry a laptop around to see events.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="sdk" className="border-none">
                        <AccordionTrigger className="text-base">You don&apos;t have an SDK for my framework</AccordionTrigger>
                        <AccordionContent>
                            <p>
                                We thought of that too! Since Upstream is still relatively new, we&apos;re
                                currently working on expanding our SDK support.
                            </p>

                            <p className="mt-4">
                                If your language isn&apos;t supported by our SDKs, you can still send events
                                using our Ingestion API. See the{" "}
                                <Link href="/docs" className="underline">
                                    docs
                                </Link>{" "}
                                for more details.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="getstarted" className="border-none">
                        <AccordionTrigger className="text-base">I&apos;m sold! How do I get started?</AccordionTrigger>
                        <AccordionContent>
                            <p>
                                Cool! Register a free account <Link href="/register" className="underline">here</Link>.
                            </p>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>

            </section>

            <section className="-mt-30 flex flex-col items-center px-4 py-16 sm:py-24">
                <div className="mx-auto w-full max-w-2xl">
                    <Card className="relative overflow-hidden ring-0">
                        <CardContent className="relative flex flex-col items-center gap-6 py-16 text-center">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
                                Seen enough? Get started for free.
                            </h2>
                            <p className="max-w-lg text-base text-muted-foreground">
                                Integrate Upstream into your project in minutes. No credit card required.
                            </p>
                            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                                <Button size="lg" className="w-full sm:w-auto gap-2 text-sm font-semibold">
                                    <Link href="/register">Get started</Link>
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="lg"
                                    className="w-full sm:w-auto gap-2 text-sm font-semibold"
                                >
                                    <Link href="/docs">Documentation</Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </section>
        </div>
    )
}
