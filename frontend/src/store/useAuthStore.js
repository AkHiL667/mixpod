import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
const BASE_URL = "http://localhost:5001";

export const useAuthStore = create((set, get) => ({
  authUser: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,
  isCheckingAuth: true,
  onlineUsers: [],
  socket: null,

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("/auth/check");
      set({ authUser: response.data });
      get().connectSocket();
    } catch (error) {
      console.error(error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  Signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const response = await axiosInstance.post("/auth/signup", data);
      set({ authUser: response.data });
      toast.success("Account created successfully");
      get().connectSocket();
    } catch (error) {
      console.error(error);
      toast.error(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const response = await axiosInstance.post("/auth/login", data);
      set({ authUser: response.data });
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
      const response = await axiosInstance.put("/auth/update/profile", data);
      if (response && response.data) {
        set({ authUser: response.data });
        toast.success("Profile updated successfully");
      } else {
        throw new Error("No data received from server");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data?.message || "Failed to update profile");
      } else if (error.request) {
        // The request was made but no response was received
        toast.error("No response from server. Please try again.");
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error("Error setting up the request");
      }
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  connectSocket: async () => {
    const { authUser } = get();

    if (!authUser || (get().socket && get().socket.connected)) return;

    const newSocket = io(BASE_URL, {
      withCredentials: true,
      query: {
        userId: authUser._id,
      }
    });

    newSocket.on("connect", () => {
      console.log("Socket connected successfully");
    });

    newSocket.on("getOnlineUsers", (userIds) => {
      console.log("Received online users:", userIds);
      set({ onlineUsers: userIds });
    });

    set({ socket: newSocket });
  },
  disconnectSocket: async (data) => {
    const socket = get().socket;
    if (socket?.connected) socket.disconnect();
    set({ socket: null });
  },
}));
