// Service Worker for Push Notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;

  try {
    const data = event.data.json();
    const title = data.title || "Friendly Chat";
    const options = {
      body: data.body || "You received a new message",
      icon: data.icon || "/chaticon.jpg",
      badge: "/chaticon.jpg",
      vibrate: [200, 100, 200],
      tag: data.tag || "message-notification",
      renotify: true,
      data: data.data || { url: "/" },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (error) {
    console.error("Error processing push event:", error);
  }
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((windowClients) => {
      for (let client of windowClients) {
        if (client.url.includes(targetUrl) && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
