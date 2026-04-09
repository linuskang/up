"use client";

import { authClient } from "@/client/auth"
import { redirect } from "next/navigation";
import Event from "@/components/event";

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
                <Event
                    title="You logged into Quacky"
                    icon="🔥"
                    time="09:04 pm"
                    content="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
                    fields={[
                        {
                            name: "Name",
                            value: "Linus Kang"
                        },
                        {
                            name: "Browser",
                            value: "Chrome on Windows 10"
                        },
                        {
                            name: "IP Address",
                            value: "10.0.0.141"
                        }
                    ]}
                    events={[
                        {
                            icon: "📱",
                            time: "09:05 pm",
                            content: "sent request to phone",
                        },
                        {
                            icon: "💻",
                            time: "09:07 pm",
                            content: "accepted login on windows",
                        }
                    ]}
                    data={
                        {
                            ip: "10.0.0.141",
                            location: "San Francisco, CA",
                            device: "Chrome on Windows 10",
                        }
                    }
                    actions={
                        [
                            {
                                label: "View details",
                                type: "primary",
                                url: "https://linuskang.au"
                            },
                            {
                                label: "Dismiss",
                                type: "secondary",
                                url: "#"
                            }
                        ]
                    }
                />
            </div>
        </div>
    )
}
