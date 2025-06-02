import asyncHandler from 'express-async-handler';
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";


const signup = asyncHandler(async(req,res)=>{
 //get the info form req body
 const {userName, email, password} = req.body;
 //check password
 if(password < 6 ) return res.status(400).json({message:"password must be 6 characters"});
  //check if user exist
 const userExist = await User.findOne({email});
 //give error if user already exists
 if(userExist) return res.status(400).json({message:"user with this mail already exists"});
 //create salt for hashing
 const salt = await bcrypt.genSalt(10);
 //hash password
 const hashedPassword = await bcrypt.hash(password,salt);
 //create new user
 const newuser = new User({
  userName,
  email,
  password:hashedPassword
 });
});
//generate the jwt token
if(newuser){

}else{
  return res.status(400).json({message:"invalid user data"})
}






// export const signup = async (req, res) => {
//   const { fullName, email, password } = req.body;
//   try {
//     if (password < 6) {
//       return res.status(400).json({ message: "password must me 6 characters" });
//     }
//     const user = await User.findOne({ email });
//     if (user) return res.status(400).json({ message: "user already exists" });

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);
//     const newUser = new User({
//       fullName,
//       email,
//       password: hashedPassword,
//     });
//     if(newUser){
//       //generate jwt token 
//     }else{
//       return res.status(400).json({ message: "invalid user data" });
//     }
//   } catch (error) {}
// };





























export const login = (req, res) => {
  res.send("login route");
};

export const logout = (req, res) => {
  res.send("logout route");
};
