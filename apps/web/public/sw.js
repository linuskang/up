self.addEventListener('push', function (event) {
    console.log('[SW] Push received', event)

    const showFallback = () =>
        self.registration.showNotification('Notification', {
            body: 'You have a new notification.',
            icon: '/icon.png',
        })

    if (!event.data) {
        event.waitUntil(showFallback())
        return
    }

    event.waitUntil(
        (async () => {
            try {
                const data = event.data.json()
                const options = {
                    body: data.body,
                    icon: data.icon || '/icon.png',
                    badge: '/badge.png',
                    vibrate: [100, 50, 100],
                    data: {
                        dateOfArrival: Date.now(),
                        primaryKey: '2',
                    },
                }
                await self.registration.showNotification(
                    data.title || 'Notification',
                    options
                )
                console.log('[SW] Notification shown')
            } catch (error) {
                console.error('[SW] Failed to show notification:', error)
                await showFallback()
            }
        })()
    )
})

self.addEventListener('notificationclick', function (event) {
    console.log('[SW] Notification click received.')
    event.notification.close()
    event.waitUntil(clients.openWindow('https://your-website.com'))
})
