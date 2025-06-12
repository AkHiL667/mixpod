import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import SimplePeer from "simple-peer";
import toast from "react-hot-toast";

export const useCallStore = create((set, get) => ({
  stream: null,
  call: null,
  callAccepted: false,
  callEnded: false,
  peer: null,
  isVideo: false,
  callRinging: false,

  setStream: (stream) => set({ stream }),
  setCall: (call, isIncoming = false) => set({ call, callRinging: isIncoming }),
  setCallAccepted: (accepted) => set({ callAccepted: accepted }),
  setCallEnded: (ended) => set({ callEnded: ended }),
  setCallRinging: (ringing) => set({ callRinging: ringing }),

  initializeMedia: async (isVideo = true) => {
    try {
      // Stop any existing tracks first
      const currentStream = get().stream;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      
      const newStream = await navigator.mediaDevices.getUserMedia({ 
        video: isVideo, 
        audio: true 
      });
      set({ stream: newStream, isVideo });
      return newStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      toast.error("Failed to access media devices");
      return null;
    }
  },

  startCall: async (userToCall, isVideo) => {
    try {
      const stream = await get().initializeMedia(isVideo);
      if (!stream) return;

      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream
      });

      peer.on("signal", (data) => {
        const socket = useAuthStore.getState().socket;
        socket.emit("callUser", {
          userToCall,
          signalData: data,
          from: useAuthStore.getState().authUser?._id,
          name: useAuthStore.getState().authUser?.fullName,
          isVideo
        });
      });

      peer.on("stream", (remoteStream) => {
        const remoteVideo = document.querySelector("#remoteVideo");
        const remoteAudio = document.querySelector("audio");
        if (remoteVideo && isVideo) {
          remoteVideo.srcObject = remoteStream;
        }
        if (remoteAudio && !isVideo) {
          remoteAudio.srcObject = remoteStream;
        }
      });

      set({ 
        peer, 
        isVideo,
        call: {
          isVideo,
          from: useAuthStore.getState().authUser?._id,
          to: userToCall
        }
      });
    } catch (error) {
      console.error("Error starting call:", error);
      toast.error("Failed to start call");
      const currentStream = get().stream;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    }
  },

  answerCall: async () => {
    try {
      const stream = await get().initializeMedia(get().call?.isVideo);
      if (!stream) return;

      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream
      });

      peer.on("signal", (data) => {
        const socket = useAuthStore.getState().socket;
        socket.emit("answerCall", {
          signal: data,
          to: get().call.from
        });
      });

      peer.on("stream", (remoteStream) => {
        const remoteVideo = document.querySelector("#remoteVideo");
        const remoteAudio = document.querySelector("audio");
        if (remoteVideo && get().call?.isVideo) {
          remoteVideo.srcObject = remoteStream;
        }
        if (remoteAudio && !get().call?.isVideo) {
          remoteAudio.srcObject = remoteStream;
        }
      });

      peer.signal(get().call.signal);
      set({ 
        peer, 
        callAccepted: true, 
        isVideo: get().call?.isVideo,
        callRinging: false
      });
    } catch (error) {
      console.error("Error answering call:", error);
      toast.error("Failed to answer call");
      const currentStream = get().stream;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
    }
  },

  endCall: () => {
    const { stream, peer } = get();
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    if (peer) {
      peer.destroy();
    }
    const socket = useAuthStore.getState().socket;
    if (socket && get().call) {
      socket.emit("endCall", { to: get().call.from });
    }
    set({
      stream: null,
      call: null,
      callAccepted: false,
      callEnded: true,
      peer: null,
      isVideo: false,
      callRinging: false
    });
  }
}));