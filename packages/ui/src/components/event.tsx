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
import { Fragment, useState } from "react"
import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import type { Event } from "@workspace/contracts"

export type Events = {
  events: Event[]
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

function formatTime(dateStr: string) {
  return new Date(dateStr)
    .toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    })
    .toLowerCase()
}

function formatDuration(ms: number): string {
  const absMs = Math.max(0, ms)
  const seconds = Math.floor(absMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days} day${days === 1 ? "" : "s"} ${hours % 24} hr${hours % 24 === 1 ? "" : "s"}`
  if (hours > 0) return `${hours} hr${hours === 1 ? "" : "s"} ${minutes % 60} min${minutes % 60 === 1 ? "" : "s"}`
  if (minutes > 0) return `${minutes} min${minutes === 1 ? "" : "s"} ${seconds % 60} sec${seconds % 60 === 1 ? "" : "s"}`
  return `${seconds} sec${seconds === 1 ? "" : "s"}`
}

function CompactEventItem({ event }: { event: Event }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium leading-none text-muted-foreground">
          {formatTime(event.createdAt)}
        </span>
        <span className="text-sm leading-none font-medium text-foreground">
          {event.title}
        </span>
      </div>
      {event.description && (
        <p className="text-xs text-muted-foreground">
          {event.description}
        </p>
      )}
      {event.fields && event.fields.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
          {event.fields.map((field, index) => (
            <div key={index} className="flex min-w-0 flex-col">
              <span className="text-[11px] font-semibold text-foreground">
                {field.title}
              </span>
              <span className="min-w-0 text-[11px] text-muted-foreground break-words">
                {field.value || "Empty Content"}
              </span>
            </div>
          ))}
        </div>
      )}
      {!!event.data && (
        <div className="mt-1 max-h-32 overflow-auto rounded bg-muted/60 text-[10px]">
          <SyntaxHighlighter
            language="json"
            style={vscDarkPlus}
            customStyle={{
              margin: 0,
              padding: "0.5rem",
              background: "transparent",
            }}
          >
            {JSON.stringify(event.data, null, 2)}
          </SyntaxHighlighter>
        </div>
      )}
      {event.actions && event.actions.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {event.actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant === "primary" ? "default" : action.variant}
              size="sm"
              className="h-6 text-xs"
              onClick={() => window.open(action.url, "_blank")}
            >
              {action.title}
            </Button>
          ))}
        </div>
      )}
      {event.events && event.events.length > 0 && (
        <CompactEventTimeline events={event.events} />
      )}
    </div>
  )
}

function CompactEventTimeline({ events }: { events: Event[] }) {
  const sorted = [...events].sort(
    (a, b) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const first = new Date(sorted[0]!.createdAt)
  const last = new Date(sorted[sorted.length - 1]!.createdAt)
  const duration = last.getTime() - first.getTime()

  return (
    <div className="mt-3 grid grid-cols-[1.5rem_1fr] gap-x-3">
      {sorted.map((event, index) => {
        const isFirst = index === 0
        const isLast = index === sorted.length - 1
        return (
          <Fragment key={event.id ?? index}>
            <div className="relative">
              <div
                className={cn(
                  "absolute left-1/2 w-px -translate-x-1/2 border-l-2 border-dashed border-foreground/10",
                  isFirst ? "top-3.5 bottom-0" : "top-0 bottom-0",
                  isLast ? "bottom-3.5" : ""
                )}
              />
              <div className="relative flex size-7 items-center justify-center rounded-full bg-background text-lg leading-none">
                <span className="leading-none">{event.icon || "~"}</span>
                {event.pushNotify && (
                  <div className="absolute top-0 right-0 flex size-3.5 translate-x-1/4 -translate-y-1/4 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold leading-none text-white">
                    !
                  </div>
                )}
              </div>
            </div>
            <div className="pb-3 pt-1.5 pl-1">
              <CompactEventItem event={event} />
            </div>
          </Fragment>
        )
      })}
      <p className="col-span-2 pb-2 text-sm font-medium text-muted-foreground">
        {sorted.length} event{sorted.length === 1 ? "" : "s"}.{" "}
        {formatDuration(duration)}.
      </p>
    </div>
  )
}

export function EventsList({ events }: Events) {
  const groups: { date: string; events: Event[] }[] = []

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
  actions,
  data,

  events,

  pushNotify,
  createdAt,
}: Event) {
  const [open, setOpen] = useState(false)
  const extras = Boolean(
    description ||
    actions?.length ||
    data ||
    fields?.length
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
          {icon || "~"}
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
            <CompactEventTimeline events={events} />
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
