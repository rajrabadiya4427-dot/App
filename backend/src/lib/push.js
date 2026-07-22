import webpush from "web-push";
import User from "../models/user.model.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const vapidKeyPath = path.join(__dirname, "vapidKeys.json");

let vapidKeys;

// Load or generate persistent VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
  };
} else if (fs.existsSync(vapidKeyPath)) {
  try {
    vapidKeys = JSON.parse(fs.readFileSync(vapidKeyPath, "utf-8"));
  } catch (e) {
    vapidKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync(vapidKeyPath, JSON.stringify(vapidKeys, null, 2));
  }
} else {
  vapidKeys = webpush.generateVAPIDKeys();
  try {
    fs.writeFileSync(vapidKeyPath, JSON.stringify(vapidKeys, null, 2));
  } catch (e) {
    console.error("Could not save VAPID keys to file:", e);
  }
}

webpush.setVapidDetails(
  "mailto:support@friendlychat.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export const getVapidPublicKey = () => vapidKeys.publicKey;

export const sendPushNotification = async (receiverId, payload) => {
  try {
    const receiver = await User.findById(receiverId);
    if (!receiver || !receiver.pushSubscription || !receiver.pushSubscription.endpoint) {
      return;
    }

    const notificationPayload = JSON.stringify({
      title: payload.title || "New Message",
      body: payload.body || "You have a new message",
      icon: payload.icon || "/icon-192.png",
      badge: "/icon-192.png",
      data: payload.data || { url: "/" },
      tag: payload.tag || "chat-message-" + Date.now(),
    });

    await webpush.sendNotification(receiver.pushSubscription, notificationPayload);
  } catch (error) {
    console.error("Error sending Web Push Notification:", error.message);
    if (error.statusCode === 410 || error.statusCode === 404) {
      // Subscription expired or invalid, remove it
      await User.findByIdAndUpdate(receiverId, { $unset: { pushSubscription: 1 } });
    }
  }
};
