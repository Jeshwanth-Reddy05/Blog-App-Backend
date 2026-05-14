import exp from "express";
import { authenticate } from "../Services/authService.js";
import { UserTypeModel } from "../models/UserTypeModel.js";
import { compare, hash } from "bcryptjs";
import { verifyToken } from "../middlewares/verifyToken.js";

export const commonRouter = exp.Router();

//login or authenticate(admin,user,author)
commonRouter.post("/login", async (req, res) => {
  //get user cred objetcs
  let userCred = req.body;
  //call authenticate from service
  let { token, user } = await authenticate(userCred);
  //save token as httpOnly cookie
  res.cookie("token", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
  });
  //send res
  res.status(200).json({ message: "login sucess", payload: user });
});

//check-auth
commonRouter.get("/check-auth", verifyToken("ADMIN","USER","AUTHOR"), (req, res) => {
  res.status(200).json({
    message: "Authenticated",
    payload: req.user,
  });
});

//logout
commonRouter.get("/logout", async (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
  });
  res.status(200).json({ message: "loged out sucessfully" });
});

//change password
commonRouter.put("/change-password", async (req, res) => {
  //get current password and neww password
  let reqBody = req.body;
  let currentPass = reqBody.currentPass;
  let newPass = reqBody.newPass;
  let email = reqBody.email;
  //if mail match
  let userDoc = await UserTypeModel.findOne({
    email: email,
  });

  if (!userDoc) {
    return res.status(404).json({ message: "invalid email" });
  }

  //comapre teh passwords

  let isMatch = await compare(currentPass, userDoc.password);
  if (!isMatch) {
    return res.status(400).json({ message: "mismatch of password" });
  }

  let hashedPassword = await hash(newPass, 10);

  //replace current password with new password
  userDoc.password = hashedPassword;

  //save
  await userDoc.save();
  res.status(200).json({message :"password has been updated"})
});

