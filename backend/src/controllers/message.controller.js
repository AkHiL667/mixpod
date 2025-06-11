import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReciverSocketId } from "../lib/socket.js";
import { io } from "../lib/socket.js";

const getUsersForSidebar = asyncHandler(async (req, res) => {
  const loggedInUserId = req.user._id;
  const filteredUsers = await User.find({
    _id: { $ne: loggedInUserId },
  }).select("-password");
  if (!filteredUsers) {
    throw new Error("No users found");
  }
  res.status(200).json(filteredUsers);
});

const getMessages = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const myId = req.user._id;
  const messages = await Message.find({
    $or: [
      { senderId: myId, reciverId: userId },
      { senderId: userId, reciverId: myId },
    ],
  });
  res.status(200).json(messages);
});

const sendMessage = asyncHandler(async (req, res) => {
  const { text, image } = req.body;
  const { userId } = req.params;
  const senderId = req.user._id;
  let imageUrl;
  if (image) {
    const uploadResponse = await cloudinary.uploader.upload(image);
    imageUrl = uploadResponse.secure_url;
  }
  const newMessage = new Message({
    senderId,
    reciverId: userId,
    text,
    image: imageUrl,
  });
  await newMessage.save();
 
  const reciverSocketId = getReciverSocketId(userId);
  if(reciverSocketId){
    io.to(reciverSocketId).emit("newMessage", newMessage);
  }

  res.status(201).json(newMessage)
});

export { getUsersForSidebar, getMessages, sendMessage };
