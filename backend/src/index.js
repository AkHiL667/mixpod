import express from "express";
import authRoutes from "./routes/auth.route.js";
import dotenv from "dotenv";
import { connectDB } from "./lib/db.js";
dotenv.config();

const app = express();

app.use("/api/auth", authRoutes);
app.use(express.json());
app.listen(process.env.PORT, () => {
  console.log("server is running port :" + process.env.PORT);
  connectDB();
});
