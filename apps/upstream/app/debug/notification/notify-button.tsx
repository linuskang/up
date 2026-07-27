'use client'

import { Button } from '@/components/ui/button'
import { sendNotificationToYourself } from './actions'

export function NotifyButton() {
    return (
        <Button onClick={() => sendNotificationToYourself()}>
            Send Notification to Yourself
        </Button>
    )
}
