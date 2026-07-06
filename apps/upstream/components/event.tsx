//                                  __
//                                 |  \
//  __    __   ______    _______  _| $$_     ______    ______    ______   ______ ____
// |  \  |  \ /      \  /       \|   $$ \   /      \  /      \  |      \ |      \    \
// | $$  | $$|  $$$$$$\|  $$$$$$$ \$$$$$$  |  $$$$$$\|  $$$$$$\  \$$$$$$\| $$$$$$\$$$$\
// | $$  | $$| $$  | $$ \$$    \   | $$ __ | $$   \$$| $$    $$ /      $$| $$ | $$ | $$
// | $$__/ $$| $$__/ $$ _\$$$$$$\  | $$|  \| $$      | $$$$$$$$|  $$$$$$$| $$ | $$ | $$
//  \$$    $$| $$    $$|       $$   \$$  $$| $$       \$$     \ \$$    $$| $$ | $$ | $$
//   \$$$$$$ | $$$$$$$  \$$$$$$$     \$$$$  \$$        \$$$$$$$  \$$$$$$$ \$$  \$$  \$$
//           | $$
//           | $$
//            \$$

"use client"

// Libs
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism"

// Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { useState, type ReactNode } from "react"
import { Button } from "./ui/button"

// Types
export type Events = {
    events: EventProps[]
}

export type EventProps = {
    title: string
    icon: string
    createdAt: string
    content?: ReactNode
    category?: string
    fields?: {
        name: string
        value: string
    }[]
    events?: {
        icon: string
        time: string
        content: ReactNode
    }[]
    data?: unknown
    actions?: {
        title: string
        type: "default" | "secondary" | "ghost"
        url: string
    }[]
}

function formatDate(dateStr: string) {
    const [year, month, day] = dateStr.split("-").map(Number)
    return new Date(year, month - 1, day).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
    })
}

function getDayKey(date: Date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
}

export function EventsList({ events }: Events) {
    const groups: { date: string; events: EventProps[] }[] = []

    for (const event of events) {
        const dayKey = getDayKey(new Date(event.createdAt))
        const last = groups[groups.length - 1]
        if (last && last.date === dayKey) {
            last.events.push(event)
        } else {
            groups.push({ date: dayKey, events: [event] })
        }
    }

    const hasMultipleDays = groups.length > 1

    return (
        <div className="flex flex-col gap-2">
            {groups.map((group, groupIndex) => (
                <div key={groupIndex} className="flex flex-col gap-2">
                    {hasMultipleDays && (
                        <p className="text-semibold py-1 text-sm text-muted-foreground">
                            Events on {formatDate(group.date)}
                        </p>
                    )}
                    {group.events.map((event, index) => (
                        <Event
                            key={index}
                            title={event.title}
                            icon={event.icon}
                            createdAt={event.createdAt}
                            content={event.content}
                            category={event.category}
                            fields={event.fields}
                            events={event.events}
                            data={event.data}
                            actions={event.actions}
                        />
                    ))}
                </div>
            ))}
        </div>
    )
}

export function Event({
    title,
    icon,
    createdAt,
    content,
    category,
    fields,
    events,
    data,
    actions,
}: EventProps) {
    const [open, setOpen] = useState(false)
    const extras = Boolean(
        content || actions?.length || data || fields?.length || events?.length
    )
    const [copied, setCopied] = useState(false)

    const copyJson = () => {
        if (data) {
            navigator.clipboard.writeText(JSON.stringify(data, null, 2))

            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    return (
        <Card className="mx-auto w-full gap-0 bg-muted/40 p-3 ring-0">
            <CardHeader
                className={`group flex flex-row items-center space-y-0 p-0 transition-opacity ${extras ? "cursor-pointer select-none hover:opacity-80" : ""}`}
                onClick={() => extras && setOpen(!open)}
            >
                <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-2xl">
                    {icon}
                </div>

                <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 pl-3">
                    <CardTitle className="flex w-full flex-1 items-center text-sm leading-none font-medium">
                        <p className="shrink-0 text-base leading-none font-medium text-muted-foreground">
                            {new Date(createdAt)
                                .toLocaleTimeString("en-US", {
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                })
                                .toLowerCase()}
                        </p>

                        <p
                            className={`ml-2 text-base leading-snug text-foreground ${open ? "whitespace-normal break-words" : "truncate"}`}
                        >
                            {title}
                        </p>

                        {category && (
                            <span className="ml-2 hidden shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize sm:inline-block">
                                {category}
                            </span>
                        )}

                        {/* 2. Swapped <Button> for a simple <div> */}
                        {extras && (
                            <div className="ml-auto flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors group-hover:bg-muted group-hover:text-foreground">
                                {open ? (
                                    <ChevronUp className="size-5" />
                                ) : (
                                    <ChevronDown className="size-5" />
                                )}
                            </div>
                        )}
                    </CardTitle>
                </div>
            </CardHeader>

            <CardContent
                className={`grid p-0 pl-[3.25rem] transition-all duration-300 ease-out ${open ? "mt-3 grid-rows-[1fr] opacity-100" : "mt-0 grid-rows-[0fr] opacity-0"}`}
            >
                <div className="min-h-0 overflow-hidden">
                    {content && (
                        <div className="whitespace-pre-wrap break-words text-sm leading-relaxed text-muted-foreground">
                            {content}
                        </div>
                    )}
                    {fields && (
                        <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-2">
                            {fields.map((field, index) => {
                                const isEmpty =
                                    !field.value || field.value.trim() === ""
                                return (
                                    <div
                                        key={index}
                                        className="flex min-w-0 flex-col"
                                    >
                                        <span className="text-sm text-muted-foreground">
                                            {field.name}
                                        </span>
                                        <span
                                            className={`min-w-0 break-words text-sm font-medium ${isEmpty ? "text-muted-foreground/60 italic" : "text-foreground"}`}
                                        >
                                            {isEmpty
                                                ? "Empty Content"
                                                : field.value}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                    {events && (
                        <div className="mt-3 space-y-3">
                            {events.map((event, index) => (
                                <div
                                    key={index}
                                    className="flex items-center gap-3"
                                >
                                    <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/20 text-xs">
                                        {event.icon}
                                    </div>
                                    <div className="flex min-w-0 flex-1 flex-row items-center gap-2">
                                        <p className="shrink-0 text-sm leading-none font-medium text-foreground">
                                            {event.time}
                                        </p>
                                        <p className="truncate text-sm leading-none text-muted-foreground">
                                            {event.content}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {!!data && (
                        <div className="group relative mt-4">
                            <Button
                                variant="secondary"
                                size="icon"
                                className="absolute top-2 right-2 z-20 h-6 w-6 opacity-0 transition-opacity group-hover:opacity-100"
                                onClick={copyJson}
                                title="Copy JSON"
                            >
                                {copied ? (
                                    <Check className="size-4" />
                                ) : (
                                    <Copy className="size-3" />
                                )}
                            </Button>

                            <div className="max-h-80 overflow-auto rounded bg-muted/60 text-xs">
                                <SyntaxHighlighter
                                    language="json"
                                    style={vscDarkPlus}
                                    customStyle={{
                                        margin: 0,
                                        padding: "0.75rem",
                                        background: "transparent",
                                    }}
                                >
                                    {JSON.stringify(data, null, 2)}
                                </SyntaxHighlighter>
                            </div>
                        </div>
                    )}
                    {actions && (
                        <div className="mt-4 flex flex-wrap gap-2">
                            {actions.map((action, index) => (
                                <Button
                                    key={index}
                                    variant={action.type}
                                    size="sm"
                                    onClick={() =>
                                        window.open(action.url, "_blank")
                                    }
                                >
                                    {action.title}
                                </Button>
                            ))}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}
