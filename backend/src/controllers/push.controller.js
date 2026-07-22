import User from "../models/user.model.js";
import { getVapidPublicKey } from "../lib/push.js";

export const getVapidKey = (req, res) => {
  try {
    const publicKey = getVapidPublicKey();
    res.status(200).json({ publicKey });
  } catch (error) {
    console.error("Error getting VAPID key:", error);
    res.status(500).json({ message: "Failed to get VAPID key" });
  }
};

export const subscribePush = async (req, res) => {
  try {
    const subscription = req.body;
    const userId = req.user._id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: "Invalid subscription object" });
    }

    await User.findByIdAndUpdate(userId, { pushSubscription: subscription });
    res.status(200).json({ message: "Push subscription saved successfully" });
  } catch (error) {
    console.error("Error saving push subscription:", error);
    res.status(500).json({ message: "Failed to save push subscription" });
  }
};

export const unsubscribePush = async (req, res) => {
  try {
    const userId = req.user._id;
    await User.findByIdAndUpdate(userId, { $unset: { pushSubscription: 1 } });
    res.status(200).json({ message: "Unsubscribed from push notifications" });
  } catch (error) {
    console.error("Error unsubscribing push:", error);
    res.status(500).json({ message: "Failed to unsubscribe" });
  }
};
