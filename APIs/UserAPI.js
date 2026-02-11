import exp from "express";
import { register, authenticate } from "../Services/authService.js";
import { config } from "dotenv";
import { checkAuthor } from "../middlewares/checkAuthor.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { UserTypeModel } from "../models/UserTypeModel.js";
config();
export const userRoute = exp.Router();

//register user
userRoute.post("/users", async (req, res) => {
  //get user objects from req
  let userObj = req.body;
  //call register from authService
  const newUserObj = await register({ ...userObj, role: "USER" });
  //send res
  res.status(201).json({ message: "user created", payload: newUserObj });
});
//authenticate user
// userRoute.post("/authenticate", async (req, res) => {
//   //get user cred objetcs
//   let userCred = req.body;
//   //call authenticate from service
//   let { token, user } = await authenticate(userCred);
//   //save token as httpOnly cookie
//   res.cookie("token", token, {
//     httpOnly: true,
//     sameSite: "lax",
//     secure: false,
//   });
//   //send res
//   res.status(200).json({ message: "login sucess", payload: user });
// });
//read all articles
userRoute.get("/articles", verifyToken, async (req, res) => {
  //get articles
  let articles = await ArticleModel.find().populate("author");
  //if articles not found
  if (!articles) {
    return res.status(401).json({ message: "no articles" });
  }
  //respond
  res.status(200).json({ message: "list of articles are :", articles });
});

userRoute.post("/articles", async (req, res) => {
  //get article
  let { user, articleId, comments } = req.body;
  //find user
  let userDoc = await UserTypeModel.findById(user);
  if (!userDoc) {
    return res.status(401).json({message:"user not found"});
  }
  //check if user or not
  if (!userDoc?.role == "USER") {
    return res.status(401).json({ message: "cannot comment" });
  }
  let artice = await ArticleModel.findById(articleId);
  if (!artice) {
    return res.status(401).json({ message: "user not found" });
  }
  //update comment
  let updatedArticle = await ArticleModel.findByIdAndUpdate(articleId, {
    $push: { comments: { user: user, comment: comments } },
  });
  //send res
  return res
    .status(200)
    .json({ message: "commented!", payload: updatedArticle });
});
