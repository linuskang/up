export interface Event {
    id: string
    title: string
    icon: string
    content?: string
    category?: string
    fields?: {
        title: string
        value: string
    }[]
    events?: JSON
    data?: JSON
    actions?: {
        title: string
        variant: "primary" | "secondary"
        url: string
    }[]
    pageOwner?: boolean
    notifyOwner?: boolean
    createdAt: string
    projectId: string
    project: {
        id: string
        name: string
    }
}