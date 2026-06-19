
// i hate typescript >:(

export interface UsageStats {
    plan: string
    projects: {
        current: number
        limit: number
    }
    eventsToday: {
        current: number
    }
    eventsMonth: {
        current: number
        limit: number
    }
}

export interface User {
    id: string
    name: string
    email: string
    image: string
    plan: string
    createdAt: string
    updatedAt: string
}

export interface ApiKey {
    id: string
    key: string
    name: string
    createdAt: string
    updatedAt: string
    lastUsed: string | null
    addedbyId: string
    addedBy: {
        id: string
        name: string
        email: string
        image: string
    }
    active: boolean
    projectId: string
    project: {
        id: string
        name: string
    }
}

export interface Event {
    id: string
    title: string
    icon: string
    content?: string
    category?: string
    fields?: JSON
    events?: JSON
    data?: JSON
    actions?: JSON
    createdAt: string
    projectId: string
    project: {
        id: string
        name: string
    }
}

export interface AuditLog {
    id: string
    projectId: string
    project: {
        id: string
        name: string
    }
    userId: string
    user: {
        name: string
        image: string
    }
    message: string
    createdAt: string
}

export interface Project {
    id: string
    name: string
    ownerId: string
    owner: {
        id: string
        name: string
        email: string
        image: string
    }
    apiKeys: ApiKey[]
    events: Event[]
    auditLogs: AuditLog[]
    requestLogs: RequestLog[]
}

export interface RequestLog {
    id: string
    projectId: string
    endpoint: string
    method: string
    status: number
    userAgent: string
    requestBody: string | null
    responseBody: string | null
    createdAt: string
}