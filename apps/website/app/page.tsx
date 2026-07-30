import Link from "next/link"

import { EventsList, Event } from "@uplabs/ui/components/event"
import { Button } from "@uplabs/ui/components/button"
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@uplabs/ui/components/accordion"

import { Navbar } from "@/components/navbar"
import { DemoEvents } from "@/components/demo-events"

const starterCode = `import { Upstream } from "@uplabs/sdk"
const up = new Upstream("my_api_key")

up.events.log({
    title: "hello, world!",
    icon: "👋",
})
`

const moreDetailedCode = `up.events.log({
    title: "hello, world!",
    icon: "👋",
    description: "this is a more detailed event",
    fields: [
        {
            title: "this is a field",
            value: "you can add some info here",
        },
        {
            title: "this is another field",
            value: "you can add some more info here",
        },
    ],
    events: [
        {
            title: "you can add some content here",
            icon: "📝",
            createdAt: new Date().toISOString(),
        },
        {
            title: "another event",
            icon: "📄",
            createdAt: new Date().toISOString(),
        },
    ],
})
`

export default function Home() {
    return (
        <div className="flex min-h-screen flex-col">
            <Navbar />
            <section className="relative flex flex-col px-4 pt-20 text-center">
                <div className="mx-auto w-full max-w-2xl space-y-6 px-2 sm:px-0">

                    <h1 className="text-3xl leading-tight font-bold tracking-tight text-foreground sm:text-5xl">
                        Simple and open event logs for your next project.
                    </h1>

                    <p className="mx-auto max-w-lg text-sm text-muted-foreground sm:text-base">
                        Upstream is a simple logging platform for developers.
                        View your events in a beautifully designed dashboard
                        with powerful searching capabilities.
                    </p>

                    <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Button
                            size="lg"
                            className="w-full gap-2 text-sm font-semibold sm:w-auto"
                        >
                            <Link href="https://up.linus.my/register" target="_blank">
                                Create a free account
                            </Link>
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-full gap-2 text-sm font-semibold sm:w-auto"
                        >
                            <Link href="/docs">View the docs</Link>
                        </Button>
                    </div>
                </div>

                <div className="mx-auto w-full mt-5 max-w-md sm:mt-12">
                    <EventsList events={DemoEvents} />
                </div>
            </section>

            <section className="flex flex-col items-center px-4 py-16 -mt-10 sm:py-24">
                <div className="max-w-lg space-y-4">
                    <p className="text-lg text-muted-foreground">
                        look. <strong>managing your most critical event in a project is not easy.</strong>{" "}
                        every project needs an logs viewer, searching APIs, SDKs, and analytics. <strong>there are a lot of moving parts.</strong>
                    </p>
                    <p className="text-lg text-muted-foreground">
                        we&apos;ve all been there before, its a pain to set up and maintain. this is why developers pay for logging platforms.
                        <br />
                        <br />
                        however, they are extremely expensive, and not designed for small projects with critical events.
                        <br />
                        <br />
                        <strong className="text-white">thats why i built this solution.</strong>
                    </p>
                </div>

                <div className="mt-8 w-full max-w-lg space-y-4 border-t border-border pt-8">
                    <p className="text-lg text-muted-foreground">
                        heres what it looks like.
                    </p>

                    <pre className="rounded-lg bg-card p-5 text-sm">
                        <code>{starterCode}</code>
                    </pre>

                    <p className="text-lg text-muted-foreground">
                        6 lines of code, and you can easily start logging critical events to our dashboard. heres what the event looks like.
                    </p>

                    <Event
                        title="hello, world!"
                        icon="👋"
                        createdAt={new Date().toISOString()}
                    />

                    <p className="text-lg text-muted-foreground">
                        need to add more details to the event? no problem. here is the code to add fields, description, and events.
                    </p>

                    <pre className="rounded-lg bg-card p-5 text-sm">
                        <code>{moreDetailedCode}</code>
                    </pre>

                    <p className="text-lg text-muted-foreground">
                        now, the event is a dropdown!
                    </p>

                    <Event
                        title="hello, world!"
                        icon="👋"
                        description="this is a more detailed event"
                        fields={[
                            {
                                title: "this is a field",
                                value: "you can add some info here",
                            },
                            {
                                title: "this is another field",
                                value: "you can add some more info here",
                            },
                        ]}
                        events={[
                            {
                                title: "you can add some content here",
                                icon: "📝",
                                createdAt: new Date().toISOString(),
                            },
                            {
                                title: "another event",
                                icon: "📄",
                                createdAt: new Date().toISOString(),
                            }
                        ]}
                        createdAt={new Date().toISOString()}
                    />

                    <p className="text-lg text-muted-foreground">
                        what if you need to trigger workflows or have actions for your events? no problem. Upstream has those features too. Simply add a <strong>category</strong> to the event and setup webhooks in the dashboard.
                    </p>

                    <p className="text-lg text-muted-foreground">
                        oh, and theres event actions too.
                    </p>

                    <Event
                        title="sophisticated event with actions"
                        icon="🚨"
                        category="important"
                        actions={[
                            {
                                title: "View Google.com",
                                variant: "primary",
                                url: "https://google.com"
                            },
                            {
                                title: "Go to Github.com",
                                variant: "secondary",
                                url: "https://github.com",
                            },
                            {
                                title: "Do nothing",
                                variant: "ghost",
                                url: "#",
                            }

                        ]}
                        createdAt={new Date().toISOString()}
                    />

                    <p className="text-lg text-muted-foreground border-t border-border mt-8 pt-6">
                        we are just scratching the surface. Upstream also has features like query APIs, a mobile app with pager and push notification features, and much more.
                    </p>

                    <p className="text-lg text-muted-foreground">
                        i also built this to be completely open source, so you can go self-host it if you want.
                    </p>

                    <p className="text-lg border-t border-border pt-6 mt-8 text-muted-foreground">
                        in case you still have questions:
                    </p>

                    <Accordion
                        type="single"
                        collapsible
                        className="mt-5 max-w-lg border-none bg-card"
                    >
                        <AccordionItem value="differences" className="border-none">
                            <AccordionTrigger className="text-base">
                                What makes this different compared to others like
                                Seq and Datadog?
                            </AccordionTrigger>
                            <AccordionContent>
                                <div>
                                    <p>
                                        Seq and Datadog are designed for the product
                                        analytics space. They ingest large volumes
                                        of events and provide powerful querying
                                        capabilities & statistics for your
                                        application.
                                    </p>

                                    <p className="mt-2">
                                        Upstream is designed for the critical
                                        logs/events space. We focus on delivering a
                                        beautiful, intuitive experience for viewing
                                        and querying your most important events on
                                        the fly. You can use Upstream for your
                                        product&apos;s audit logs, triggering
                                        workflows, and logging complex events.
                                    </p>

                                    <p className="mt-2">We have:</p>
                                    <ul className="mt-2 list-disc pl-6">
                                        <li>
                                            Arguably the best UI for querying events
                                            on the go, especially for mobile.
                                        </li>
                                        <li>
                                            Full API, easily ingest and query logs
                                            from your apps.
                                        </li>
                                        <li>
                                            Action buttons and contextIds are our
                                            main differentiators.
                                        </li>
                                        <li>
                                            Built for easy integration with your
                                            apps, no complex setup required.
                                        </li>
                                    </ul>
                                    <p className="mt-2">
                                        Upstream was built to easily view your most
                                        critical logs on the fly, with a expressive
                                        interface. If you don&apos;t need easy
                                        access to important logs, Upstream
                                        isn&apos;t for you.
                                    </p>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="usage" className="border-none">
                            <AccordionTrigger className="text-base">
                                Who is using Upstream?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p>
                                    Because Upstream is still extremely new, we
                                    don&apos;t have any major public customers yet.
                                </p>
                                <p>
                                    However, I&apos;ve personally been using it in
                                    production for the past couple months because I
                                    got tired of having to carry a laptop around to
                                    see events.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="sdk" className="border-none">
                            <AccordionTrigger className="text-base">
                                You don&apos;t have an SDK for my framework
                            </AccordionTrigger>
                            <AccordionContent>
                                <p>
                                    We thought of that too! Since Upstream is still
                                    relatively new, we&apos;re currently working on
                                    expanding our SDK support.
                                </p>

                                <p className="mt-4">
                                    If your language isn&apos;t supported by our
                                    SDKs, you can still send events using our
                                    Ingestion API. See the{" "}
                                    <Link href="/docs" className="underline">
                                        docs
                                    </Link>{" "}
                                    for more details.
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="getstarted" className="border-none">
                            <AccordionTrigger className="text-base">
                                I&apos;m sold! How do I get started?
                            </AccordionTrigger>
                            <AccordionContent>
                                <p>
                                    Cool! Register a free account{" "}
                                    <Link href="/register" className="underline">
                                        here
                                    </Link>
                                    .
                                </p>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>

                    <p className="text-lg text-muted-foreground mt-6">
                        thats it. go try it out!
                    </p>

                    <Button size="lg" className="w-full gap-2 text-sm font-semibold sm:w-auto">
                        <Link href="https://up.linus.my/register" target="_blank">
                            Create a free account
                        </Link>
                    </Button>
                </div>
            </section>
        </div>
    )
}
