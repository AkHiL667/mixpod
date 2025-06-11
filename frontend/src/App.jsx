import React from "react";
import Navbar from "./components/Navbar";
import { Navigate, Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import SignUpPage from "./pages/SignUpPage";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import ProfilePage from "./pages/ProfilePage";
import { useAuthStore } from "./store/useAuthStore.js";
import { useEffect } from "react";
import { Loader } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useThemestore } from "./store/useThemeStore.js";
import { useCallStore } from "./store/useCallStore";
import CallInterface from "./components/CallInterface";

function App() {
  const { authUser, checkAuth, isCheckingAuth, onlineUsers, socket } = useAuthStore();
  const { theme } = useThemestore();
  const { setStream, setCall, call, callAccepted, callEnded, setCallAccepted, setCallEnded } = useCallStore();

  console.log({onlineUsers})

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    // Request media permissions
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((currentStream) => {
        setStream(currentStream);
      })
      .catch((error) => {
        console.error("Error accessing media devices:", error);
      });

    return () => {
      // Cleanup streams when component unmounts
      const { stream } = useCallStore.getState();
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("callUser", ({ signal, from, name }) => {
      setCall({ signal, from, name });
    });

    socket.on("callAccepted", (signal) => {
      setCallAccepted(true);
    });

    socket.on("callRejected", () => {
      setCall(null);
    });

    socket.on("callEnded", () => {
      setCallEnded(true);
    });

    return () => {
      socket.off("callUser");
      socket.off("callAccepted");
      socket.off("callRejected");
      socket.off("callEnded");
    };
  }, [socket, setCall, setCallAccepted, setCallEnded]);

  console.log({ authUser });
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    ); 
  }
  return (
    <div data-theme={theme} className="">
      <Navbar />
      <Routes>
        <Route
          path="/"
          element={authUser ? <HomePage /> : <Navigate to="/login" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route
          path="/profile"
          element={authUser ? <ProfilePage /> : <Navigate to="/login" />}
        />
      </Routes>
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Show call interface when in a call */}
      {call && !callEnded && (
        <CallInterface />
      )}
    </div>
  );
}

export default App;
