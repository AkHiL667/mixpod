import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";
import messageRoutes from "./routes/message.route.js";
import cors from "cors"
import { app, server } from "./lib/socket.js";
dotenv.config();


app.use(express.json({ limit: "10mb" }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
  exposedHeaders: ["Set-Cookie"]
}))

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal server error",
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined
  });
});

server.listen(process.env.PORT, () => {
  console.log("server is running port :" + process.env.PORT);
  connectDB();
});
