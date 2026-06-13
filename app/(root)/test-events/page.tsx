"use client"

import { useState } from "react"
import { EventsList } from "@/components/event"
import { CategorySelector } from "@/components/category-selector"
import {
    Breadcrumb,
    BreadcrumbList,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"

export default function Page() {
    const [now] = useState(() => Date.now())
    const [events] = useState(() => [
        {
            title: "Payment Processed",
            createdAt: new Date(now).toISOString(),
            icon: "😁",
            category: "billing",
            content:
                "Your monthly subscription for the Pro tier has been successfully renewed.",
            fields: [
                { name: "Amount", value: "$49.99" },
                { name: "Card Ending In", value: "4242" },
                { name: "Invoice ID", value: "INV-10924" },
            ],
            events: [
                {
                    icon: "1",
                    time: "10:35 pm",
                    content: "Receipt emailed",
                },
                {
                    icon: "2",
                    time: "10:45 pm",
                    content: "Payment settled",
                },
            ],
            data: {
                id: "ch_3Mabc2...",
                status: "success",
                customer: {
                    id: "cus_Jklmno",
                    name: "linus",
                },
                data: {
                    object: "charge",
                    id: "ch_3Mabc2...",
                    amount: 4999,
                },
            },
            actions: [
                {
                    title: "View Invoice",
                    url: "/invoices/INV-10924",
                    type: "default" as const,
                },
                {
                    title: "Refund",
                    url: "/refund",
                    type: "secondary" as const,
                },
                {
                    title: "Contact Support",
                    url: "/support",
                    type: "ghost" as const,
                },
            ],
        },
        {
            title: "User Login",
            createdAt: new Date(now - 3600000).toISOString(),
            icon: "✈️",
            category: "authentication",
            content: "User linus logged in from a new device.",
            fields: [
                { name: "IP Address", value: "192.168.1.1" },
                { name: "Device", value: "Chrome on Windows 10" },
                { name: "Location", value: "New York, USA" },
            ],
        },
        {
            title: "Error: Payment Failed",
            createdAt: new Date(now - 7200000).toISOString(),
            icon: "❌",
        },
    ])

    return (
        <main>
            <div className="flex min-h-svh flex-col items-center gap-6 p-6 pt-4">
                <div className="flex flex-col gap-3">
                    <Breadcrumb>
                        <BreadcrumbList className="text-sm">
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">Projects</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>My Project</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-semibold">Events</h1>

                        <Button className="w-fit" variant="default" size="sm">
                            Manage Project
                        </Button>
                    </div>

                    <div className="flex gap-3">
                        <div className="sticky top-6 h-fit">
                            <CategorySelector
                                categories={[
                                    { name: "all", count: 2 },
                                    { name: "billing", count: 4 },
                                    { name: "security", count: 1 },
                                ]}
                                selectedCategory={"all"}
                            />
                        </div>
                        <EventsList events={events} />
                    </div>
                </div>
            </div>
        </main>
    )
}
