import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";
import { triggerBrowserNotification } from "../lib/notification";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,

  wallpaper: localStorage.getItem("chatWallpaper") || null,

  setWallpaper: (wallpaper) => {
    localStorage.setItem("chatWallpaper", wallpaper);
    set({ wallpaper });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data });
    } catch (error) {
      toast.error(error.response.data?.message || "Failed to fetch users");
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data });
    } catch (error) {
      toast.error(error.response.data?.message || "Failed to fetch messages");
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  sendMessage: async (messageData) => {
    const { selectedUser, messages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );
      set({ messages: [...messages, res.data] });
    } catch (error) {
      toast.error(error.response.data?.message || "Failed to send message");
    }
  },

  listenWallpaperChange: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("wallpaperChanged"); // avoid duplicate listeners

    socket.on("wallpaperChanged", ({ wallpaper }) => {
      localStorage.setItem("chatWallpaper", wallpaper);
      set({ wallpaper });
    });
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return;

    socket.off("newMessage");

    socket.on("newMessage", (newMessage) => {
      const { selectedUser, messages, users } = get();

      const isMessageSentFromSelectedUser =
        selectedUser && newMessage.senderId === selectedUser._id;

      if (isMessageSentFromSelectedUser) {
        set({
          messages: [...messages, newMessage],
        });
      }

      // Show notification if app is hidden/minimized OR message is from unselected user
      if (document.hidden || !isMessageSentFromSelectedUser) {
        const sender = users.find((u) => u._id === newMessage.senderId);
        const title = newMessage.senderName || sender?.fullName || "New Message";
        const body = newMessage.text || (newMessage.image ? "📷 Photo" : "Sent a message");
        const icon = newMessage.senderPic || sender?.profilePic || "/chaticon.jpg";

        triggerBrowserNotification(title, body, icon, newMessage.senderId);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
