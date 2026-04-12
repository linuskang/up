import { ReactNode } from "react";

export type Project = {
    id: string;
    name: string;
    members: {
        id: string;
        role: "OWNER" | "ADMIN" | "MEMBER";
        user: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
    }[];
    createdAt: string;
    updatedAt: string;
};

export type EventProps = {
    icon: string;
    time: string;
    title: string;
    content?: ReactNode;
    category?: string;
    fields?: {
        name: string;
        value: string;
    }[]
    events?: {
        icon: string;
        time: string;
        content: ReactNode;
    }[]
    data?: unknown;
    actions?: {
        label: string;
        type: "primary" | "secondary";
        url: string;
    }[]
}
