export type Field = {
    title: string
    value: string
}

export type TimelineEvent = {
    title: string
    icon: string
    createdAt: string
}

export type Action = {
    title: string
    variant: "primary" | "secondary" | "ghost"
    url: string
}

export type EventProps = {
    title: string
    icon?: string
    createdAt?: string
    description?: string
    category?: string
    fields?: Field[]
    events?: TimelineEvent[]
    data?: unknown
    actions?: Action[]
    contextId?: string
    pushNotify?: boolean
}
