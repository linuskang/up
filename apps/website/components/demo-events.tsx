import type { EventProps } from "@uplabs/ui/components/event"

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
            { title: "Endpoint", value: "/api/webhooks/stripe" },
            { title: "Status", value: "200 OK" },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        title: "stripe: early fraud warning",
        icon: "🚨",
        description: "Stripe has detected a potential fraud on your account.",
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
                variant: "primary",
            },
            {
                title: "Mark as safe",
                url: "#",
                variant: "secondary",
            },
        ],
        createdAt: new Date().toISOString(),
    },
    {
        title: "user signed up",
        icon: "🙅",
        category: "auth",
        description: "A new user has signed up for your service.",
        fields: [
            { title: "User ID", value: "1234567890abcdef" },
            { title: "Email", value: "user@example.com" },
            { title: "IP Address", value: "192.168.1.1" },
            { title: "User Agent", value: "Chrome/58.0.3029.110 Safari/537.3" },
        ],
        data: {
            id: "1234567890abcdef",
            object: "user",
            email: "user@example.com",
        },
        events: [
            {
                title: "user: account created",
                icon: "🆕",
                createdAt: new Date().toISOString(),
            },
            {
                title: "user: email sent",
                icon: "📧",
                createdAt: new Date().toISOString(),
            },
            {
                title: "user: email verified",
                icon: "✅",
                createdAt: new Date().toISOString(),
            },
        ],
        actions: [
            {
                title: "View user profile",
                url: "#",
                variant: "primary",
            },
            {
                title: "Send welcome email",
                url: "#",
                variant: "secondary",
            },
        ],
        createdAt: new Date().toISOString(),
    },
]
