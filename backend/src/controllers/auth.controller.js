import asyncHandler from "express-async-handler";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import { generateToken } from "../lib/utils.js";
import cloudinary from "../lib/cloudinary.js";

const signup = asyncHandler(async (req, res) => {
  //get the info from req body
  const { fullName, email, password } = req.body;
  //check is all fields are filled
  if (!fullName || !email || !password) {
    return res.status(400).json({ message: "must fill all the fields" });
  }
  //check password
  if (!password || password.length < 6)
    return res.status(400).json({ message: "password must be 6 characters" });
  //check if user exists
  const userExist = await User.findOne({ email });
  if (userExist)
    return res
      .status(400)
      .json({ message: "user with this mail already exists" });
  //create salt for hashing
  const salt = await bcrypt.genSalt(10);
  //hash password
  const hashedPassword = await bcrypt.hash(password, salt);
  //create new user
  const newuser = new User({
    fullName,
    email,
    password: hashedPassword,
  });

  if (newuser) {
    await newuser.save();
    generateToken(newuser._id, res);
    res.status(201).json({
      _id: newuser._id,
      fullName: newuser.fullName,
      email: newuser.email,
      profilePic: newuser.profilePic,
    });
  } else {
    return res.status(400).json({ message: "invalid user data" });
  }
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //check if email and password are filled
  if (!email || !password) {
    return res.status(400).json({ message: "enter all the fields" });
  }
  //check if user exists
  const user = await User.findOne({ email });

  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  //check password is correct
  const isPasswordCorrect = await bcrypt.compare(password, user.password);
  if (!isPasswordCorrect) {
    return res.status(400).json({ message: "Invalid credentials" });
  }
  generateToken(user._id, res);
  res.status(200).json({
    _id: user._id,
    fullName: user.fullName,
    email: user.email,
    profilePic: user.profilePic,
  });
});

const logout = asyncHandler((req, res) => {
  res.cookie("jwt", "", { maxAge: 0 });
  res.status(200).json({ message: "logged out successfully" });
});

const updateProfile = asyncHandler(async(req, res) => {
  try {
    const {profilePic} = req.body;
    const userId = req.user._id;
    
    if(!profilePic){
      return res.status(400).json({message: "Profile picture is required"});
    }

    // Validate the base64 image
    if (!profilePic.startsWith('data:image/')) {
      return res.status(400).json({message: "Invalid image format"});
    }

    // Upload to Cloudinary
    let uploadResponse;
    try {
      uploadResponse = await cloudinary.uploader.upload(profilePic, {
        folder: "profile_pics",
        resource_type: "auto",
        allowed_formats: ["jpg", "jpeg", "png", "gif"]
      });
    } catch (error) {
      console.error("Cloudinary upload error:", error);
      return res.status(500).json({ 
        message: "Failed to upload image to Cloudinary",
        error: error.message 
      });
    }

    // Update user profile
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {profilePic: uploadResponse.secure_url},
      {new: true}
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({message: "User not found"});
    }

    res.status(200).json(updatedUser);
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({
      message: "Internal server error",
      error: error.message
    });
  }
});

const checkAuth = asyncHandler((req,res)=>{
res.status(200).json(req.user);
})
 

export { signup, login, logout, updateProfile, checkAuth};
