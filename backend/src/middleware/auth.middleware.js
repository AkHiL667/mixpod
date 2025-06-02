import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import asyncHandler from "express-async-handler";

const protectRoute = asyncHandler(async (req, res, next) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.status(400).json({ message: "unauthorized -no token provided" });
  }

  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  if (!decoded) {
    return res.status(401).json({ message: "unauthorized-token invalid" });
  }
  const user = await User.findById(decoded.userId).select("-password");

  if (!user) {
    return res.status(401).json({ message: "unauthorized-user not found" });
  }
  req.user = user;
  next();
});

export default protectRoute;