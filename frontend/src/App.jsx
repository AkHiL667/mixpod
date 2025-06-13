import React, { useEffect, lazy, Suspense } from "react";
import Navbar from "./components/Navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore.js";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemestore } from "./store/useThemeStore.js";
import { useCallStore } from "./store/useCallStore";
import CallInterface from "./components/CallInterface";

// Lazy load pages
const HomePage = lazy(() => import("./pages/HomePage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));

function App() {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, socket } = useAuthStore();
  const { theme } = useThemestore();
  const { 
    setStream, 
    setCall, 
    call, 
    callAccepted, 
    callEnded, 
    setCallAccepted, 
    setCallEnded, 
    stream,
    peer 
  } = useCallStore();

  console.log({onlineUsers})

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Cleanup function for media stream
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  useEffect(() => {
    if (!socket) return;

    socket.on("callUser", ({ signal, from, name, isVideo }) => {
      console.log("Received call from:", from, "isVideo:", isVideo);
      setCall({ signal, from, name, isVideo }, true);
    });

    socket.on("callAccepted", (signal) => {
      console.log("Call accepted, signal:", signal);
      setCallAccepted(true);
      if (peer) {
        peer.signal(signal);
      }
    });

    socket.on("callRejected", () => {
      console.log("Call rejected");
      setCall(null);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });

    socket.on("callEnded", () => {
      console.log("Call ended");
      setCallEnded(true);
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    });

    return () => {
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callEnded");
    };
  }, [socket, setCall, setCallAccepted, setCallEnded, stream, peer]);

  console.log({ authUser });
  if (isCheckingAuth && !authUser) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    ); 
  }
  return (
    <div data-theme={theme} className="h-screen-dvh overflow-hidden">
      <Navbar />
      <Toaster position="top-center" />
      <Suspense fallback={
        <div className="h-screen flex items-center justify-center">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      }>
        <Routes>
          <Route path="/" element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path="/login" element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/signup" element={!authUser ? <SignUpPage /> : <Navigate to="/" />} />
          <Route path="/settings" element={authUser ? <SettingsPage /> : <Navigate to="/login" />} />
          <Route path="/profile" element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
        </Routes>
      </Suspense>
      
      {/* Show call interface when in a call */}
      {call && !callEnded && (
        <CallInterface />
      )}
    </div>
  );
}

export default App;
