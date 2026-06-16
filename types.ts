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