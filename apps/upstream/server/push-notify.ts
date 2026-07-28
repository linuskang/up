import webpush, { WebPushError } from 'web-push'
import { prisma } from '@/server/prisma'

webpush.setVapidDetails(
    'mailto:m@linus.id.au',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export interface PushNotificationPayload {
    title?: string
    body: string
    icon?: string
}

export async function sendPushNotification(
    userId: string,
    payload: PushNotificationPayload
) {
    const subscriptions = await prisma.pushSubscription.findMany({
        where: { userId },
    })

    if (subscriptions.length === 0) {
        return { success: false, error: 'No subscriptions found for user' }
    }

    const body = JSON.stringify({
        title: payload.title ?? 'Notification',
        body: payload.body,
        icon: payload.icon ?? '/icon.png',
        badge: '/badge.png',
    })

    const results = await Promise.allSettled(
        subscriptions.map((sub) =>
            webpush.sendNotification(
                {
                    endpoint: sub.endpoint,
                    keys: {
                        auth: sub.auth,
                        p256dh: sub.p256dh,
                    },
                },
                body
            )
        )
    )

    let removed = 0
    for (let i = 0; i < results.length; i++) {
        const result = results[i]
        if (result.status === 'rejected') {
            const error = result.reason
            if (error instanceof WebPushError && (error.statusCode === 404 || error.statusCode === 410)) {
                await prisma.pushSubscription.delete({
                    where: { endpoint: subscriptions[i].endpoint },
                })
                removed++
            }
        }
    }

    return { success: true, sent: subscriptions.length - removed }
}
