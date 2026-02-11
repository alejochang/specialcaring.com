/**
 * Push Notification Handler for Service Worker
 *
 * This file is imported by the main service worker
 * to handle push notifications for Special Caring.
 */

// Handle incoming push notifications
self.addEventListener('push', (event) => {
  if (!event.data) {
    console.log('Push event without data');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    // If not JSON, treat as text
    data = {
      title: 'Special Caring',
      body: event.data.text(),
    };
  }

  const options = {
    body: data.body || 'You have a new notification',
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-72.png',
    tag: data.tag || 'default',
    data: {
      url: data.url || '/',
      type: data.type,
      childId: data.childId,
    },
    actions: data.actions || [],
    requireInteraction: data.requireInteraction || false,
    vibrate: [200, 100, 200],
    timestamp: Date.now(),
  };

  // Add type-specific icons and styling
  switch (data.type) {
    case 'medication':
      options.icon = '/icons/icon-medication.png';
      break;
    case 'appointment':
      options.icon = '/icons/icon-calendar.png';
      break;
    case 'emergency':
      options.requireInteraction = true;
      options.vibrate = [500, 200, 500, 200, 500];
      break;
    case 'care_team':
      options.icon = '/icons/icon-team.png';
      break;
  }

  event.waitUntil(
    self.registration.showNotification(data.title || 'Special Caring', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const url = event.notification.data?.url || '/';
  const action = event.action;

  // Handle action button clicks
  if (action === 'view') {
    // Navigate to specific view
  } else if (action === 'dismiss') {
    // Just close
    return;
  } else if (action === 'snooze') {
    // Schedule reminder for later (would need server support)
    return;
  }

  // Open or focus the app
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if app is already open
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(url);
          return;
        }
      }
      // Open new window
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  // Track notification dismissals for analytics
  console.log('Notification closed:', event.notification.tag);
});

// Handle background sync for pending notifications
self.addEventListener('sync', (event) => {
  if (event.tag === 'special-caring-sync') {
    event.waitUntil(handleBackgroundSync());
  }
});

async function handleBackgroundSync() {
  // This would sync pending offline data when online
  console.log('Background sync triggered');
  // The actual sync logic is in the main app
}
