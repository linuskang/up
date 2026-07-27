'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'
import { subscribeUser, unsubscribeUser, sendNotificationToMe } from './actions'

interface BeforeInstallPromptEvent extends Event {
    prompt: () => void
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

function useIsPushSupported() {
    return useSyncExternalStore(
        () => () => {},
        () =>
            typeof window !== 'undefined' &&
            'serviceWorker' in navigator &&
            'PushManager' in window,
        () => false
    )
}

function PushNotificationManager() {
    const isSupported = useIsPushSupported()
    const [subscription, setSubscription] = useState<PushSubscription | null>(
        null
    )
    const [message, setMessage] = useState('')

    useEffect(() => {
        if (!isSupported) return

        let cancelled = false

        navigator.serviceWorker
            .register('/sw.js', {
                scope: '/',
                updateViaCache: 'none',
            })
            .then((registration) => registration.pushManager.getSubscription())
            .then((sub) => {
                if (!cancelled) {
                    setSubscription(sub)
                }
            })

        return () => {
            cancelled = true
        }
    }, [isSupported])

    async function subscribeToPush() {
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(
                process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
            ),
        })
        setSubscription(sub)
        const serializedSub = JSON.parse(JSON.stringify(sub))
        await subscribeUser(serializedSub)
    }

    async function unsubscribeFromPush() {
        if (subscription) {
            await subscription.unsubscribe()
            await unsubscribeUser(subscription.endpoint)
            setSubscription(null)
        }
    }

    async function sendTestNotification() {
        if (subscription) {
            await sendNotificationToMe(message)
            setMessage('')
        }
    }

    if (!isSupported) {
        return <p>Push notifications are not supported in this browser.</p>
    }

    return (
        <div>
            <h3>Push Notifications</h3>
            {subscription ? (
                <>
                    <p>You are subscribed to push notifications.</p>
                    <button onClick={unsubscribeFromPush}>Unsubscribe</button>
                    <input
                        type="text"
                        placeholder="Enter notification message"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                    />
                    <button onClick={sendTestNotification}>Send Test</button>
                </>
            ) : (
                <>
                    <p>You are not subscribed to push notifications.</p>
                    <button onClick={subscribeToPush}>Subscribe</button>
                </>
            )}
        </div>
    )
}

function InstallPrompt() {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

    useEffect(() => {
        const handler = (event: BeforeInstallPromptEvent) => {
            event.preventDefault()
            setInstallPrompt(event)
        }

        window.addEventListener(
            'beforeinstallprompt',
            handler as EventListener
        )

        return () => {
            window.removeEventListener(
                'beforeinstallprompt',
                handler as EventListener
            )
        }
    }, [])

    async function installApp() {
        if (!installPrompt) return

        installPrompt.prompt()

        const result = await installPrompt.userChoice

        console.log(result.outcome)

        setInstallPrompt(null)
    }

    return (
        <div>
            <h3>Install App</h3>

            <button onClick={installApp}>
                Add to Home Screen
            </button>
        </div>
    )
}

export default function Page() {
    return (
        <div>
            <PushNotificationManager />
            <InstallPrompt />
        </div>
    )
}