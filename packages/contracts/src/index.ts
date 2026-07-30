export type JSON = any

export interface Event {
    id: string

    title: string
    icon: string

    description?: string
    category?: string

    fields?: {
        title: string
        value: string
    }[]
    events?: {
        title: string
        icon: string
        createdAt: string
    }[]
    actions?: {
        title: string
        variant: "primary" | "secondary" | "ghost"
        url: string
    }[]
    data?: JSON

    contextId?: string

    pushNotify: boolean

    projectId: string
    project: {
        id: string
        name: string
    }

    createdAt: string
}