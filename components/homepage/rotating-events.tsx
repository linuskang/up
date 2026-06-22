"use client"

import { useState, useEffect, useCallback, useRef, type ReactNode } from "react"
import { Event } from "@/components/event"

interface EventTemplate {
    title: string
    icon: string
    category?: string
    content?: ReactNode
    fields?: { name: string; value: string }[]
    events?: { icon: string; time: string; content: ReactNode }[]
    data?: unknown
    actions?: { title: string; type: "default" | "secondary" | "ghost"; url: string }[]
}

interface EventItem extends EventTemplate {
    id: string
    createdAt: string
}

const VISIBLE_COUNT = 4
const INTERVAL_MS = 1500
const ANIM_MS = 500

const EVENT_TEMPLATES: EventTemplate[] = [
    // Simple events
    { title: "cronjob completed", icon: "⚙️" },
    { title: "Server CPU spike", icon: "📈" },
    { title: "Memory usage high", icon: "🔥" },
    { title: "Newsletter sent", icon: "📧" },

    // With category
    {
        title: "User unsubscribed",
        icon: "😢",
        category: "billing",
    },
    {
        title: "Payment received",
        icon: "💰",
        category: "stripe",
    },
    {
        title: "Database backup failed",
        icon: "💥",
        category: "devops",
    },

    // With fields
    {
        title: "New user signup",
        icon: "🎉",
        fields: [
            { name: "Email", value: "hello@example.com" },
            { name: "Plan", value: "Pro" },
        ],
    },
    {
        title: "Webhook delivered",
        icon: "🔗",
        category: "stripe",
        fields: [
            { name: "Endpoint", value: "/api/webhooks/stripe" },
            { name: "Status", value: "200 OK" },
        ],
    },
    {
        title: "Deploy completed",
        icon: "🚀",
        category: "vercel",
        fields: [
            { name: "Project", value: "upstream-app" },
            { name: "Branch", value: "main" },
        ],
    },

    // With JSON data
    {
        title: "stripe: early fraud warning",
        icon: "🚨",
        category: "stripe",
        data: {
            id: "pi_3O1234567890abcdef",
            object: "payment_intent",
            amount: 4999,
            currency: "usd",
            status: "requires_action",
            fraud_details: {
                stripe_report: "fraudulent",
                user_report: null,
            },
        },
    },
    {
        title: "API error logged",
        icon: "❌",
        category: "api",
        data: {
            error: "Internal Server Error",
            status: 500,
            path: "/api/v1/users",
            method: "POST",
            timestamp: new Date().toISOString(),
            trace: [
                "at /app/routes/users.ts:42",
                "at /app/services/db.ts:18",
                "at processTicksAndRejections (internal)",
            ],
        },
    },
    {
        title: "New order received",
        icon: "🛒",
        category: "ecom",
        data: {
            order_id: "ord_987654321",
            customer: { id: "cus_123", name: "Jane Doe" },
            items: [
                { sku: "SHIRT-001", qty: 2, price: 29.99 },
                { sku: "MUG-042", qty: 1, price: 14.99 },
            ],
            total: 74.97,
            currency: "USD",
        },
    },

    // With sub-events
    {
        title: "SSL certificate expiring",
        icon: "🔒",
        category: "devops",
        events: [
            { icon: "📅", time: "now", content: "Expires in 7 days" },
            { icon: "📧", time: "now", content: "Alert email sent to admin" },
        ],
    },
    {
        title: "Pipeline failed",
        icon: "🚫",
        category: "ci",
        events: [
            { icon: "🔧", time: "now", content: "Build step failed" },
            { icon: "📋", time: "now", content: "Tests: 3 failed, 47 passed" },
            { icon: "📁", time: "now", content: "Artifact upload skipped" },
        ],
    },

    // With actions
    {
        title: "Suspicious login attempt",
        icon: "🔐",
        category: "security",
        content: "A login was attempted from an unrecognized IP address.",
        fields: [
            { name: "IP", value: "192.168.1.100" },
            { name: "Location", value: "Sao Paulo, BR" },
        ],
        actions: [
            { title: "Block IP", type: "ghost", url: "#" },
            { title: "Approve", type: "default", url: "#" },
        ],
    },
    {
        title: "Failed payment",
        icon: "💳",
        category: "stripe",
        content: "The customer's payment method was declined.",
        fields: [
            { name: "Customer", value: "Acme Corp" },
            { name: "Amount", value: "$199.00" },
        ],
        actions: [
            { title: "Retry", type: "default", url: "#" },
            { title: "Contact", type: "secondary", url: "#" },
        ],
    },
    {
        title: "Incident opened",
        icon: "⚠️",
        category: "statuspage",
        content: "API response times are elevated.",
        actions: [
            { title: "View status", type: "default", url: "#" },
            { title: "Acknowledge", type: "secondary", url: "#" },
        ],
    },

    // Mixed content
    {
        title: "User feedback received",
        icon: "💬",
        content: "The app is great, but I wish the dark mode was more contrasty.",
    },
    {
        title: "Feature flag toggled",
        icon: "🚩",
        fields: [
            { name: "Flag", value: "new-checkout" },
            { name: "Environment", value: "production" },
        ],
        data: {
            flag: "new-checkout",
            enabled: true,
            rollout: 100,
            variants: ["control", "treatment"],
        },
    },
]

function makeInitialState(): EventItem[] {
    const now = new Date()
    return [
        { ...EVENT_TEMPLATES[0], id: "init-0", createdAt: new Date(now.getTime() - 0).toISOString() },
        { ...EVENT_TEMPLATES[1], id: "init-1", createdAt: new Date(now.getTime() - 60_000).toISOString() },
        { ...EVENT_TEMPLATES[2], id: "init-2", createdAt: new Date(now.getTime() - 120_000).toISOString() },
        { ...EVENT_TEMPLATES[3], id: "init-3", createdAt: new Date(now.getTime() - 180_000).toISOString() },
    ]
}

function randomEvent(): EventItem {
    const template = EVENT_TEMPLATES[Math.floor(Math.random() * EVENT_TEMPLATES.length)]
    const offset = Math.floor(Math.random() * 60) * 60 * 1000
    return {
        ...template,
        id: Math.random().toString(36).slice(2, 11),
        createdAt: new Date(new Date().getTime() - offset).toISOString(),
    }
}

export function RotatingEvents() {
    const [items, setItems] = useState<EventItem[]>(makeInitialState)
    // Items animating in (just added at the top) or out (sliding off the bottom).
    // Collapsed rows use a 0fr grid track, so the list grows/shrinks by the card's
    // own height — no hardcoded pixel math, so nothing can drift out of alignment.
    const [enteringId, setEnteringId] = useState<string | null>(null)
    const [leavingId, setLeavingId] = useState<string | null>(null)

    const itemsRef = useRef(items)
    useEffect(() => {
        itemsRef.current = items
    }, [items])
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
    const timeoutsRef = useRef<ReturnType<typeof setTimeout>[]>([])

    const stop = useCallback(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
        }
        timeoutsRef.current.forEach(clearTimeout)
        timeoutsRef.current = []
    }, [])

    const tick = useCallback(() => {
        const current = itemsRef.current
        const overflow = current[VISIBLE_COUNT - 1]
        const newItem = randomEvent()

        // Add the new item collapsed at the top. The oldest item stays at full
        // height for now so the list's total height doesn't change on insert.
        setItems([newItem, ...current])
        setEnteringId(newItem.id)

        // Next frame: expand the new item and collapse the old one on the SAME
        // frame, so their heights cancel out exactly. The total height stays
        // constant, so nothing below the list (e.g. the Houston block) shifts.
        requestAnimationFrame(() =>
            requestAnimationFrame(() => {
                setEnteringId(null)
                setLeavingId(overflow?.id ?? null)
            })
        )

        // Drop the collapsed item only after its transition has fully finished, so
        // the node is never yanked mid-fade (which is what made it look abrupt).
        const t = setTimeout(() => {
            setItems((prev) => prev.filter((i) => i.id !== overflow?.id))
            setLeavingId(null)
        }, ANIM_MS + 80)
        timeoutsRef.current.push(t)
    }, [])

    const start = useCallback(() => {
        stop()
        intervalRef.current = setInterval(tick, INTERVAL_MS)
    }, [stop, tick])

    useEffect(() => {
        const onVisibilityChange = () => {
            if (document.visibilityState === "hidden") {
                stop()
            } else if (!intervalRef.current) {
                // Only restart if the interval was actually stopped (page was truly
                // hidden). Mobile browsers can fire visibilitychange for non-visibility
                // reasons (address bar, keyboard, etc.) — restarting on those would
                // keep resetting the timer and prevent the carousel from moving.
                setItems((prev) => prev.slice(0, VISIBLE_COUNT))
                setEnteringId(null)
                setLeavingId(null)
                start()
            }
        }

        document.addEventListener("visibilitychange", onVisibilityChange)
        start()

        return () => {
            document.removeEventListener("visibilitychange", onVisibilityChange)
            stop()
        }
    }, [start, stop])

    return (
        <div
            className="mx-auto w-full max-w-[400px] px-2 sm:px-0 h-[360px] overflow-y-auto overscroll-behavior-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            style={{ overflowAnchor: 'none' }}
        >
            {items.map((item) => {
                const collapsed = item.id === enteringId || item.id === leavingId
                return (
                    <div
                        key={item.id}
                        className="grid transition-[grid-template-rows] duration-500 ease-out"
                        style={{ gridTemplateRows: collapsed ? "0fr" : "1fr" }}
                    >
                        <div className="min-h-0 overflow-hidden">
                            <div
                                className={`pb-2 transition-[opacity,transform] duration-500 ease-in-out ${collapsed ? "-translate-y-1 opacity-0" : "translate-y-0 opacity-100"}`}
                            >
                                <Event
                                    title={item.title}
                                    icon={item.icon}
                                    createdAt={item.createdAt}
                                    category={item.category}
                                    content={item.content}
                                    fields={item.fields}
                                    events={item.events}
                                    data={item.data}
                                    actions={item.actions}
                                />
                            </div>
                        </div>
                    </div>
                )
            })}
        </div>
    )
}