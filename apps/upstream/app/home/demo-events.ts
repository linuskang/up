import type { EventProps } from "@/components/event"

export const DemoEvents: EventProps[] = [
    {
        title: "hello, world!",
        icon: "👋",
        createdAt: new Date().toISOString(),
    },
    {
        title: "webhook delivered",
        icon: "🔗",
        fields: [
            { name: "Endpoint", value: "/api/webhooks/stripe" },
            { name: "Status", value: "200 OK" },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        title: "stripe: early fraud warning",
        icon: "🚨",
        content: "Stripe has detected a potential fraud on your account.",
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
        actions: [
            {
                title: "View in Stripe",
                url: "#",
                type: "default"
            },
            {
                title: "Mark as safe",
                url: "#",
                type: "secondary"
            }
        ],
        createdAt: new Date().toISOString(),
    },
    {
        title: "user signed up",
        icon: "🙅",
        category: "auth",
        content: "A new user has signed up for your service.",
        fields: [
            { name: "User ID", value: "1234567890abcdef" },
            { name: "Email", value: "user@example.com" },
            { name: "IP Address", value: "192.168.1.1" },
            { name: "User Agent", value: "Chrome/58.0.3029.110 Safari/537.3" },
        ],
        data: {
            id: "1234567890abcdef",
            object: "user",
            email: "user@example.com"
        },
        events: [
            {
                content: "user: account created",
                icon: "🆕",
                time: "10:00 am",
            },
            {
                content: "user: email sent",
                icon: "📧",
                time: "10:05 am",
            },
            {
                content: "user: email verified",
                icon: "✅",
                time: "10:10 am",
            }
        ],
        actions: [
            {
                title: "View user profile",
                url: "#",
                type: "default"
            },
            {
                title: "Send welcome email",
                url: "#",
                type: "secondary"
            }
        ],
        createdAt: new Date().toISOString(),
    }
]