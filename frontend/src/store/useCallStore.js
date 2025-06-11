import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";
import SimplePeer from "simple-peer";

export const useCallStore = create((set, get) => ({
  call: null,
  callAccepted: false,
  callEnded: false,
  stream: null,
  peerConnection: null,

  setStream: (stream) => set({ stream }),
  setCall: (call) => set({ call }),
  setCallAccepted: (accepted) => set({ callAccepted: accepted }),
  setCallEnded: (ended) => set({ callEnded: ended }),
  setPeerConnection: (peer) => set({ peerConnection: peer }),

  initializeMediaStream: async (isVideo = true) => {
    try {
      const { stream } = get();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: isVideo,
        audio: true
      });
      
      set({ stream: newStream });
      return newStream;
    } catch (error) {
      console.error("Error accessing media devices:", error);
      throw error;
    }
  },

  startCall: async (userToCall, isVideo = true) => {
    const { authUser, socket } = useAuthStore.getState();
    
    try {
      const stream = await get().initializeMediaStream(isVideo);
      
      const peer = new SimplePeer({
        initiator: true,
        trickle: false,
        stream
      });

      peer.on("signal", (data) => {
        socket.emit("callUser", {
          userToCall,
          signalData: data,
          from: authUser._id,
          name: authUser.fullName,
          isVideo
        });
      });

      peer.on("stream", (remoteStream) => {
        set({ stream: remoteStream });
      });

      set({ peerConnection: peer });
    } catch (error) {
      console.error("Error starting call:", error);
      const { stream } = get();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      set({ stream: null });
    }
  },

  answerCall: async () => {
    const { call } = get();
    const { socket } = useAuthStore.getState();

    try {
      const stream = await get().initializeMediaStream(call.isVideo);
      
      const peer = new SimplePeer({
        initiator: false,
        trickle: false,
        stream
      });

      peer.on("signal", (data) => {
        socket.emit("answerCall", { signal: data, to: call.from });
      });

      peer.on("stream", (remoteStream) => {
        set({ stream: remoteStream });
      });

      peer.signal(call.signal);
      set({ peerConnection: peer, callAccepted: true });
    } catch (error) {
      console.error("Error answering call:", error);
      const { stream } = get();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      set({ stream: null });
    }
  },

  endCall: () => {
    const { peerConnection, stream } = get();
    const { socket } = useAuthStore.getState();
    const { call } = get();

    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    if (call) {
      socket.emit("endCall", { to: call.from });
    }

    set({
      call: null,
      callAccepted: false,
      callEnded: true,
      stream: null,
      peerConnection: null
    });
  }
}));