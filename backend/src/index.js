import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import cookieParser from "cookie-parser"
import { connectDB } from "./lib/db.js";
import messageRoutes from "./routes/message.route.js"
dotenv.config();


const app = express();

app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRoutes);
app.use("/api/message", messageRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack); // shows file and line
  res.status(500).json({ message: err.message });
});


app.listen(process.env.PORT, () => {
  console.log("server is running port :" + process.env.PORT);
  connectDB();
});
