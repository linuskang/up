"use client"

import { useState, useMemo } from "react"

import { Event } from "@workspace/ui/components/event"
import { EventSearch } from "@workspace/ui/components/event-search"

import type { Event as EventType } from "@workspace/contracts"

export default function Page() {
  const [query, setQuery] = useState("")

  const events: EventType[] = useMemo(() => {
    const now = new Date()
    return [
      {
        id: "test-event",
        title: "daily billing sync started",
        createdAt: now.toISOString(),
        pushNotify: true,
        icon: "📄",
        description: "Automated billing sync initiated for the workspace.",
        category: "billing",
        fields: [
          { title: "Workspace", value: "Acme Corp" },
          { title: "Invoices", value: "198" },
          { title: "Currency", value: "USD" },
          { title: "Run ID", value: "run_7f8a9b2c" },
        ],
        actions: [
          { title: "View Run", variant: "primary", url: "#" },
          { title: "Logs", variant: "secondary", url: "#" },
        ],
        data: {
          source: "scheduler",
          environment: "production",
          retries: 0,
        },
        events: [
          {
            id: "test-event-1",
            title: "processed invoices",
            createdAt: new Date(now.getTime() + 1200).toISOString(),
            pushNotify: false,
            icon: "📄",
            description: "Batch processed all pending invoices.",
            category: "billing",
            fields: [
              { title: "Processed", value: "198" },
              { title: "Skipped", value: "4" },
            ],
            actions: [],
            data: { batchId: "batch_001" },
            events: [],
          },
          {
            id: "test-event-2",
            title: "daily billing sync finished",
            createdAt: new Date(now.getTime() + 3400).toISOString(),
            pushNotify: true,
            icon: "✅",
            description: "Sync completed with a few failures.",
            category: "billing",
            fields: [
              { title: "Succeeded", value: "194" },
              { title: "Failed", value: "4" },
            ],
            actions: [
              { title: "Retry Failed", variant: "primary", url: "#" },
            ],
            data: {
              summary: {
                succeeded: 194,
                failed: 4,
                skipped: 0,
              },
            },
            events: [
              {
                id: "test-event-2-1",
                title: "retry queued",
                createdAt: new Date(now.getTime() + 3600).toISOString(),
                pushNotify: false,
                icon: "!",
                description: "Failed invoices queued for retry.",
                category: "billing",
                fields: [
                  { title: "Retry Count", value: "1" },
                ],
                actions: [],
                data: { failedIds: ["inv_001", "inv_002", "inv_003", "inv_004"] },
                events: [],
              },
            ],
          },
        ],
      },
      {
        id: "second-event",
        title: "user signed up",
        createdAt: new Date(now.getTime() - 1000 * 60 * 5).toISOString(),
        pushNotify: false,
        icon: "🚀",
        description: "A new user completed the onboarding flow.",
        category: "auth",
        fields: [
          { title: "Email", value: "user@example.com" },
          { title: "Plan", value: "Pro" },
        ],
        actions: [
          { title: "View Profile", variant: "secondary", url: "#" },
        ],
        data: { userId: "usr_123", referrer: "twitter" },
      },
    ]
  }, [])

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return events

    return events.filter((event) => {
      const match = (str?: string | null) =>
        str?.toLowerCase().includes(q) ?? false

      if (match(event.title)) return true
      if (match(event.description)) return true
      if (match(event.category)) return true
      if (event.fields?.some((f) => match(f.title) || match(f.value))) return true
      if (event.actions?.some((a) => match(a.title))) return true
      if (match(JSON.stringify(event.data))) return true
      return false
    })
  }, [events, query])

  return (
    <div className="flex flex-col gap-2 max-w-md mx-auto py-6">
      <EventSearch value={query} onChange={setQuery} />

      {filteredEvents.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No events match &quot;{query}&quot;.
        </p>
      ) : (
        filteredEvents.map((event) => <Event key={event.id} {...event} />)
      )}
    </div>
  )
}
