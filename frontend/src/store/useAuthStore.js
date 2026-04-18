import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import { useChatStore } from "./useChatStore";

const BASE_URL =
  import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,
  requests: [],

  checkAuth: async () => {
    try {
      const res = await axiosInstance.get("/auth/check");

      set({ authUser: res.data });
      get().connectSocket();
    } catch (error) {
      console.log("Error in checkAuth:", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/auth/signup", data);
      set({ authUser: res.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/auth/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");

      get().connectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      await axiosInstance.post("/auth/logout");
      set({ authUser: null });
      toast.success("Logged out successfully");
      get().disconnectSocket();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const res = await axiosInstance.put("/auth/update-profile", data);
      set({ authUser: res.data });
      toast.success("Profile updated successfully");
    } catch (error) {
      console.log("error in update profile:", error);
      toast.error(error.response.data.message);
    } finally {
      set({ isUpdatingProfile: false });
    }
  },

  // useAuthStore.js
 connectSocket: () => {
  const { authUser } = get();
  if (!authUser || get().socket?.connected) return;

  const socket = io(BASE_URL, {
    query: { userId: authUser._id },
  });
  socket.connect();
  set({ socket });

  // Remove old listeners
  socket.off("getOnlineUsers");
  socket.off("userDeleted");
  socket.off("contactRemoved");
  socket.off("requestAccepted");

  socket.on("getOnlineUsers", (userIds) => {
    set({ onlineUsers: userIds });
  });

  // ✅ Handle userDeleted with safe check
  socket.on("userDeleted", (data) => {
    // data could be string or object
    const deletedUserId = typeof data === "object" ? data.userId : data;
    if (get().authUser?._id === deletedUserId) {
      get().logout();
      toast.error("Your account has been deleted.");
    }
  });

  // ✅ Handle contactRemoved with safe check
  socket.on("contactRemoved", (data) => {
    const removedUserId = typeof data === "object" ? data.userId : data;
    const chatStore = useChatStore.getState();
    
    // Deselect if the removed user is currently selected
    if (chatStore.selectedUser?._id === removedUserId) {
      chatStore.setSelectedUser(null);
    }
    // Refresh the sidebar user list
    chatStore.getUsers();
  });

  socket.on("requestAccepted", (data) => {
    // Trigger refresh
    useChatStore.getState().getUsers(data);
  });
},

  disconnectSocket: () => {
    if (get().socket?.connected) get().socket.disconnect();
  },

  acceptRequest: async (id) => {
    try {
      await axiosInstance.put(`/requests/accept/${id}`);

      // refresh requests
      get().getRequests();
      useChatStore.getState().getUsers();
   
    } catch (error) {
      console.error(error);
    }
  },

  sendRequest: async (mobileNumber) => {
    try {
      await axiosInstance.post("/requests/send", { mobileNumber });
    } catch (error) {
      console.error(error);
    }
  },

  getRequests: async () => {
    try {
      const res = await axiosInstance.get("/requests");
      set({ requests: res.data });
    } catch (error) {
      console.log(error);
    }
  },
}));
