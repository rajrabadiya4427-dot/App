import { axiosInstance } from "./axios";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export const initPushNotifications = async () => {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.log("Push notifications not supported on this browser.");
    return;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.log("Notification permission denied by user.");
      return;
    }

    const registration = await navigator.serviceWorker.register("/sw.js");
    await navigator.serviceWorker.ready;

    // Fetch VAPID key from backend
    const res = await axiosInstance.get("/push/vapid-key");
    const { publicKey } = res.data;

    if (!publicKey) return;

    const convertedKey = urlBase64ToUint8Array(publicKey);

    let subscription = await registration.pushManager.getSubscription();
    if (!subscription) {
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedKey,
      });
    }

    // Send subscription object to backend
    await axiosInstance.post("/push/subscribe", subscription);
    console.log("Push Notification registration successful!");
  } catch (error) {
    console.error("Error initializing push notifications:", error);
  }
};

export const triggerBrowserNotification = (title, body, icon, senderId) => {
  if (!("Notification" in window) || Notification.permission !== "granted") return;

  const options = {
    body: body || "You have a new message",
    icon: icon || "/chaticon.jpg",
    badge: "/chaticon.jpg",
    tag: senderId ? `chat-${senderId}` : "chat-notification",
    renotify: true,
    data: { url: "/" },
  };

  if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.ready.then((registration) => {
      registration.showNotification(title, options);
    });
  } else {
    new Notification(title, options);
  }
};
