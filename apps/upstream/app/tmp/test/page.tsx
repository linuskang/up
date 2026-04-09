"use client";

import { authClient } from "@/client/auth"
import { redirect } from "next/navigation";
import type { ComponentProps } from "react";
import Event from "@/components/event";

const dummyEventsFull: ComponentProps<typeof Event>[] = [
    {
        title: "You logged into Quacky",
        icon: "🔥",
        time: "09:04 pm",
        content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        fields: [
            { name: "Name", value: "Linus Kang" },
            { name: "Browser", value: "Chrome on Windows 10" },
            { name: "IP Address", value: "10.0.0.141" }
        ],
        events: [
            { icon: "📱", time: "09:05 pm", content: "Sent request to phone" },
            { icon: "💻", time: "09:07 pm", content: "Accepted login on Windows" }
        ],
        data: { ip: "10.0.0.141", location: "San Francisco, CA", device: "Chrome on Windows 10" },
        actions: [
            { label: "View details", type: "primary", url: "https://linuskang.au" },
            { label: "Dismiss", type: "secondary", url: "#" }
        ]
    },
    {
        title: "Password changed successfully",
        icon: "🔑",
        time: "09:15 pm",
        content: "Your password was updated successfully.",
        fields: [
            { name: "Browser", value: "Firefox on macOS" },
            { name: "IP Address", value: "192.168.1.7" }
        ],
        actions: [
            { label: "View account", type: "primary", url: "#" },
            { label: "Dismiss", type: "secondary", url: "#" }
        ]
    },
    {
        title: "New device detected",
        icon: "📱",
        time: "09:20 pm",
        content: "A new device signed into your account.",
        data: { device: "iPhone 14", location: "Los Angeles, CA" },
        actions: [{ label: "Review device", type: "primary", url: "#" }]
    },
    {
        title: "Suspicious login blocked",
        icon: "⚠️",
        time: "09:35 pm",
        content: "We blocked a login attempt from an unusual location.",
        fields: [
            { name: "IP Address", value: "203.0.113.12" },
            { name: "Location", value: "Tokyo, Japan" }
        ],
        actions: [
            { label: "Secure account", type: "primary", url: "#" },
            { label: "Dismiss", type: "secondary", url: "#" }
        ]
    },
    {
        title: "Two-factor enabled",
        icon: "🔒",
        time: "10:05 pm",
        content: "Two-factor authentication has been enabled for your account.",
        events: [
            { icon: "📱", time: "10:06 pm", content: "Verification sent to your phone" }
        ],
        actions: [{ label: "View settings", type: "primary", url: "#" }]
    }
];

export default function Page() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return <div>Loading...</div>;
    }

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md">
                <div className="flex flex-col gap-4">
                    {dummyEventsFull.map((e, idx) => (
                        <Event key={idx} {...e} />
                    ))}
                </div>
            </div>
        </div>
    )
}
