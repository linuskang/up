import type { MetadataRoute } from 'next'
import { env } from '@/env'

export default function sitemap(): MetadataRoute.Sitemap {
    return [
        {
            url: env.BETTER_AUTH_URL,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${env.BETTER_AUTH_URL}/home`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${env.BETTER_AUTH_URL}/blog`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
        {
            url: `${env.BETTER_AUTH_URL}/login`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${env.BETTER_AUTH_URL}/register`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${env.BETTER_AUTH_URL}/forgot-password`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.6,
        }
    ]
}