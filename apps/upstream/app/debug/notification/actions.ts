'use server'

import { requireSession } from '@/server/auth'
import { sendPushNotification } from '@/server/push-notify'

export async function sendNotificationToYourself() {
    const session = await requireSession()
    if (!session) {
        throw new Error('User is not authenticated')
    }

    return sendPushNotification(session.user.id, {
        title: 'Test Notification',
        body: 'This is a test notification sent to yourself.',
    })
}
