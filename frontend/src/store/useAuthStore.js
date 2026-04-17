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

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds });
    });
    socket.on("friendDeleted", ({ friendId }) => {
  // Refresh the sidebar to remove the deleted friend
  import("../store/useChatStore").then(({ useChatStore }) => {
    useChatStore.getState().getUsers();
    // Also deselect if the deleted friend was selected
    const { selectedUser, setSelectedUser } = useChatStore.getState();
    if (selectedUser?._id === friendId) {
      setSelectedUser(null);
    }
  });
});

    // ✅ NEW: Listen for accepted requests and refresh sidebar
    socket.on("requestAccepted", () => {
      // Trigger a refresh of the contact list
      import("../store/useChatStore").then(({ useChatStore }) => {
        useChatStore.getState().getUsers();
      });
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
