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
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { ChevronDown, ChevronUp, Copy, Check } from "lucide-react"
import { useState } from "react"
import { Button } from "@workspace/ui/components/button"

export type EventProps = {
  id?: string
  title: string
  icon: string
  createdAt: string
  description?: string
  category?: string
  fields?: {
    title: string
    value: string
  }[]
  events?: {
    title: string
    icon: string
    createdAt: string
  }[]
  actions?: {
    title: string
    variant: "primary" | "secondary" | "ghost"
    url: string
  }[]
  data?: unknown
  contextId?: string
  pushNotify?: boolean
}

export type Events = {
  events: EventProps[]
}

function formatDate(dateStr: string) {
  const [yearStr, monthStr, dayStr] = dateStr.split("-")
  const year = Number(yearStr)
  const month = Number(monthStr)
  const day = Number(dayStr)
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
            <Event key={index} {...event} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function Event({
  title,
  icon,

  description,
  category,

  fields,
  events,
  actions,
  data,

  pushNotify,
  createdAt,
}: EventProps) {
  const [open, setOpen] = useState(false)
  const extras = Boolean(
    description ||
    actions?.length ||
    data ||
    fields?.length ||
    events?.length
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
    <Card className="mx-auto w-full gap-0 bg-muted/40 p-3 text-left ring-0">
      <CardHeader
        className={`group flex flex-row items-center space-y-0 p-0 transition-opacity ${extras ? "cursor-pointer select-none hover:opacity-80" : ""}`}
        onClick={() => extras && setOpen(!open)}
      >
        <div className="relative flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-2xl">
          {icon}
          {pushNotify && (
            <div className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
              !
            </div>
          )}
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
              className={`ml-2 text-base leading-snug text-foreground ${open ? "break-words whitespace-normal" : "truncate"}`}
            >
              {title}
            </p>

            {category && (
              <span className="ml-2 hidden shrink-0 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground capitalize sm:inline-block">
                {category}
              </span>
            )}

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
          {description && (
            <div className="text-sm leading-relaxed break-words font-medium whitespace-pre-wrap text-muted-foreground">
              {description}
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
                    <span className="text-sm font-semibold">
                      {field.title}
                    </span>
                    <span
                      className={`min-w-0 text-sm text-muted-foreground font-medium break-words ${isEmpty ? "text-muted-foreground/60 italic" : "text-foreground"}`}
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

          {events && events.length > 0 && (
            <div className="mt-3 space-y-3">
              {events.map((event, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3"
                >
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/20 text-xs">
                    {event.icon}
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <p className="text-sm font-medium text-foreground">
                      {event.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(event.createdAt)
                        .toLocaleTimeString("en-US", {
                          hour: "numeric",
                          minute: "2-digit",
                          hour12: true,
                        })
                        .toLowerCase()}
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
                  variant={action.variant === "primary" ? "default" : action.variant}
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
