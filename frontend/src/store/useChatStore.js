import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

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
      toast.error(error.response.data.message);
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
      toast.error(error.response.data.message);
    } finally {
      set({ isMessagesLoading: false });
    }
  },
  
sendMessage: async (messageData) => {
  const { selectedUser, messages } = get();
  const authUser = useAuthStore.getState().authUser;
  const isImage = !!messageData.image;

  // Temporary ID for optimistic update
  const tempId = `temp-${Date.now()}`;

  // Optimistic message object
  const optimisticMessage = {
    _id: tempId,
    senderId: authUser._id,
    receiverId: selectedUser._id,
    text: isImage ? "" : messageData.text,
    image: isImage ? messageData.image : undefined,
    createdAt: new Date().toISOString(),
    pending: true, // flag for UI styling
  };

  // Add to messages immediately (for text or image preview)
  set({ messages: [...messages, optimisticMessage] });

  try {
    const res = await axiosInstance.post(
      `/messages/send/${selectedUser._id}`,
      messageData
    );

    // Replace temp message with real one from server
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg._id === tempId ? res.data : msg
      ),
    }));
  } catch (error) {
    // Remove temp message on failure
    set((state) => ({
      messages: state.messages.filter((msg) => msg._id !== tempId),
    }));
    toast.error(error.response?.data?.message || "Failed to send message");
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
  const { selectedUser } = get();
  if (!selectedUser) return;
  const socket = useAuthStore.getState().socket;
  
  socket.off("newMessage"); // remove old listener
  socket.on("newMessage", (newMessage) => {
    // Only add if message is for current chat
    const isRelevant = 
      (newMessage.senderId === selectedUser._id && newMessage.receiverId === useAuthStore.getState().authUser._id) ||
      (newMessage.senderId === useAuthStore.getState().authUser._id && newMessage.receiverId === selectedUser._id);
    
    if (!isRelevant) return;

    set((state) => {
      // Avoid duplicate (if we already optimistically added)
      const exists = state.messages.some(msg => msg._id === newMessage._id);
      if (exists) {
        // Replace temp message
        return {
          messages: state.messages.map(msg =>
            msg._id === newMessage._id || (msg.pending && msg.text === newMessage.text && !msg.image)
              ? newMessage
              : msg
          ),
        };
      }
      return { messages: [...state.messages, newMessage] };
    });
  });
},

  unsubscribeFromMessages: () => {
    const socket = useAuthStore.getState().socket;
    socket.off("newMessage");
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));
