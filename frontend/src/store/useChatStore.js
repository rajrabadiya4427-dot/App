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
  unreadCounts: {},
  lastMessages: {},

  wallpaper: localStorage.getItem("chatWallpaper") || null,

  setWallpaper: (wallpaper) => {
    localStorage.setItem("chatWallpaper", wallpaper);
    set({ wallpaper });
  },

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      const usersData = res.data || [];
      const initialLastMessages = { ...get().lastMessages };

      usersData.forEach((u) => {
        if (u.lastMessage) {
          initialLastMessages[u._id] = u.lastMessage;
        }
      });

      set({ users: usersData, lastMessages: initialLastMessages });
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
    const { selectedUser, messages, lastMessages } = get();
    try {
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData,
      );

      const newMsg = res.data;
      set({
        messages: [...messages, newMsg],
        lastMessages: {
          ...lastMessages,
          [selectedUser._id]: {
            text: newMsg.text,
            image: newMsg.image,
            senderId: newMsg.senderId,
            createdAt: newMsg.createdAt,
          },
        },
      });
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
      const { selectedUser, messages, users, unreadCounts, lastMessages } = get();

      const senderId = String(newMessage.senderId);
      const selectedUserId = selectedUser ? String(selectedUser._id) : null;
      const isMessageSentFromSelectedUser =
        selectedUserId && senderId === selectedUserId;

      // Update last messages for sender
      const updatedLastMessages = {
        ...lastMessages,
        [senderId]: {
          text: newMessage.text,
          image: newMessage.image,
          senderId: senderId,
          createdAt: newMessage.createdAt,
        },
      };

      let updatedUnreadCounts = { ...unreadCounts };

      if (isMessageSentFromSelectedUser) {
        set({
          messages: [...messages, newMessage],
          lastMessages: updatedLastMessages,
        });
      } else {
        const currentCount = updatedUnreadCounts[senderId] || 0;
        updatedUnreadCounts[senderId] = currentCount + 1;
        set({
          unreadCounts: updatedUnreadCounts,
          lastMessages: updatedLastMessages,
        });
      }

      // Show notification if app is hidden/minimized OR message is from unselected user
      if (document.hidden || !isMessageSentFromSelectedUser) {
        const sender = users.find((u) => String(u._id) === senderId);
        const title = newMessage.senderName || sender?.fullName || "New Message";
        const body = newMessage.text || (newMessage.image ? "📷 Photo" : "Sent a message");
        const icon = newMessage.senderPic || sender?.profilePic || "/chaticon.jpg";

        triggerBrowserNotification(title, body, icon, senderId);
      }
    });
  },

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (socket) socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => {
    if (selectedUser) {
      const unreadCounts = { ...get().unreadCounts };
      delete unreadCounts[selectedUser._id];
      set({ selectedUser, unreadCounts });
    } else {
      set({ selectedUser });
    }
  },
}));
