export type Field = {
    name: string
    value: string
}

export type TimelineEvent = {
    icon: string
    time: string
    content: string
}

export type Action = {
    title: string
    type: "default" | "secondary" | "ghost"
    url: string
}

export type EventProps = {
    title: string
    icon: string
    createdAt?: string
    content?: string
    category?: string
    fields?: Field[]
    events?: TimelineEvent[]
    data?: unknown
    actions?: Action[]
}
