'use server'

import webpush, { PushSubscription } from 'web-push'

webpush.setVapidDetails(
    'mailto:m@linus.id.au',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

export async function subscribeUser(sub: PushSubscription) {
    // In a production environment, store the subscription in a database
    // For example: await db.subscriptions.create({ data: sub })
    return { success: true }
}

export async function unsubscribeUser() {
    // In a production environment, remove the subscription from the database
    // For example: await db.subscriptions.delete({ where: { ... } })
    return { success: true }
}

export async function sendNotification(
    subscription: PushSubscription,
    message: string
) {
    try {
        await webpush.sendNotification(
            subscription,
            JSON.stringify({
                title: 'Test Notification',
                body: message,
                icon: '/logo.png',
            })
        )
        return { success: true }
    } catch (error) {
        console.error('Error sending push notification:', error)
        return { success: false, error: 'Failed to send notification' }
    }
}