import type { ReactNode } from "react";

export type EventProps = {
    icon: string;
    time: string;
    title: string;
    content?: ReactNode;
    category?: string;
    fields?: {
        name: string;
        value: string;
    }[];
    events?: {
        icon: string;
        time: string;
        content: ReactNode;
    }[];
    data?: unknown;
    actions?: {
        label: string;
        type: "primary" | "secondary";
        url: string;
    }[];
};
