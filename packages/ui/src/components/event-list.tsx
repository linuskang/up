"use client"

import { Event } from "@workspace/ui/components/event"
import { formatDate, getDayKey } from "@workspace/ui/components/event-utils"

import type { Event as EventType } from "@workspace/contracts"

export type Events = {
  events: EventType[]
}

export function EventsList({ events }: Events) {
  const groups: { date: string; events: EventType[] }[] = []

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
      {groups.map((group) => (
        <div key={group.date} className="flex flex-col gap-2">
          {hasMultipleDays && (
            <p className="text-semibold py-1 text-sm text-muted-foreground">
              Events on {formatDate(group.date)}
            </p>
          )}
          {group.events.map((event) => (
            <Event key={event.id} {...event} />
          ))}
        </div>
      ))}
    </div>
  )
}
