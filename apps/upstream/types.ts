export interface Event {
    id: string;
    title: string;
    icon: string;
    time: string;
    content?: string;
    category?: string;
    fields: {
        name: string;
        value: string;
    }[];
    data?: Record<string, unknown>;
    events?: Omit<Event, "events">[];
    actions?: {
        label: string;
        type: "primary" | "secondary";
        url: string;
    }[];
}

export type Project = {
    id: string;
    name: string;
    members: {
        id: string;
        role: "ADMIN" | "MEMBER";
        user: {
            id: string;
            name: string;
            email: string;
            image: string | null;
        };
    }[];
};
