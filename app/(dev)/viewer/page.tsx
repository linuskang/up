import { EventsList } from "@/components/event";
import { CategorySelector } from "@/components/category-selector";

export default function Page() {
    return (
        <main>
            <div className="flex min-h-svh justify-center gap-3 p-6 pt-12">

                <div className="sticky top-6 h-fit">
                    <CategorySelector
                        categories={[
                            { name: "all", count: 2 },
                            { name: "billing", count: 4 },
                            { name: "security", count: 1 }
                        ]}
                        selectedCategory={"all"}
                    />
                </div>
                <EventsList
                    events={[
                        {
                            title: "Payment Processed",
                            time: "08:17 pm",
                            icon: "😁",
                            category: "billing",
                            content: "Your monthly subscription for the Pro tier has been successfully renewed.",
                            fields: [
                                { name: "Amount", value: "$49.99" },
                                { name: "Card Ending In", value: "4242" },
                                { name: "Invoice ID", value: "INV-10924" }
                            ],
                            events: [
                                {
                                    icon: "1",
                                    time: "10:35 pm",
                                    content: "Receipt emailed"
                                },
                                {
                                    icon: "2",
                                    time: "10:45 pm",
                                    content: "Payment settled",
                                }
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
                                }
                            },
                            actions: [
                                {
                                    title: "View Invoice",
                                    url: "/invoices/INV-10924",
                                    type: "default"
                                },
                                {
                                    title: "Refund",
                                    url: "/refund",
                                    type: "secondary"
                                },
                                {
                                    title: "Contact Support",
                                    url: "/support",
                                    type: "ghost"
                                }
                            ]
                        },
                        {
                            title: "User Login",
                            time: "09:00 am",
                            icon: "✈️",
                            category: "authentication",
                            content: "User linus logged in from a new device.",
                            fields: [
                                { name: "IP Address", value: "192.168.1.1" },
                                { name: "Device", value: "Chrome on Windows 10" },
                                { name: "Location", value: "New York, USA" }
                            ],
                        },
                        {
                            title: "Error: Payment Failed",
                            time: "11:45 am",
                            icon: "❌",
                        }
                    ]}
                />
            </div>
        </main>
    );
}