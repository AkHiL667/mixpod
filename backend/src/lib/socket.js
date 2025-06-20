import { Server } from "socket.io";
import http from "http";
import express from "express";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === "production" 
      ? [process.env.FRONTEND_URL, "https://mixpod.onrender.com"]
      : "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "cookie"],
  },
});

const userSocketMap = {};

export function getReciverSocketId(userId) {
  return userSocketMap[userId];
}

io.on("connection", (socket) => {
  console.log("a new client connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId) {
    userSocketMap[userId] = socket.id;
    console.log("User added to online users:", userId);
    console.log("Current online users:", Object.keys(userSocketMap));
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("a client disconnected", socket.id);
    if (userId) {
      delete userSocketMap[userId];
      console.log("User removed from online users:", userId);
      console.log("Current online users:", Object.keys(userSocketMap));
    }
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Handle call initiation
  socket.on("callUser", ({ userToCall, signalData, from, name, isVideo }) => {
    const userSocketId = userSocketMap[userToCall];
    if (userSocketId) {
      io.to(userSocketId).emit("callUser", {
        signal: signalData,
        from,
        name,
        isVideo
      });
    }
  });

  // Handle call acceptance
  socket.on("answerCall", ({ to, signal }) => {
    const userSocketId = userSocketMap[to];
    if (userSocketId) {
      io.to(userSocketId).emit("callAccepted", signal);
    }
  });

  // Handle call rejection
  socket.on("rejectCall", ({ to }) => {
    const userSocketId = userSocketMap[to];
    if (userSocketId) {
      io.to(userSocketId).emit("callRejected");
    }
  });

  // Handle call end
  socket.on("endCall", ({ to }) => {
    const userSocketId = userSocketMap[to];
    if (userSocketId) {
      io.to(userSocketId).emit("callEnded");
    }
  });
});

export { io, app, server };
