import exp from "express";
import { register, authenticate } from "../Services/authService.js";
import { config } from "dotenv";
import { checkAuthor } from "../middlewares/checkAuthor.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import { UserTypeModel } from "../models/UserTypeModel.js";
import { upload } from "../config/multer.js";
import { uploadToCloudinary } from "../config/cloudinaryUpload.js";
import cloudinary from "../config/cloudinary.js";

config();
export const userRoute = exp.Router();

//register user
userRoute.post(
  "/users",
  upload.single("profileImageUrl"),
  async (req, res, next) => {
    let cloudinaryResult;

    try {
      let userObj = req.body;

      //  Step 1: upload image to cloudinary from memoryStorage (if exists)
      if (req.file) {
        cloudinaryResult = await uploadToCloudinary(req.file.buffer);
      }

      // Step 2: call existing register()
      const newUserObj = await register({
        ...userObj,
        role: "USER",
        profileImageUrl: cloudinaryResult?.secure_url,
      });

      res.status(201).json({
        message: "user created",
        payload: newUserObj,
      });
    } catch (err) {
      // Step 3: rollback
      if (cloudinaryResult?.public_id) {
        await cloudinary.uploader.destroy(cloudinaryResult.public_id);
      }

      next(err); // send to your error middleware
    }
  },
);
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
userRoute.get("/articles", verifyToken("USER"), async (req, res) => {
  //get articles
  let articles = await ArticleModel.find({ isArticleActive: true }).populate(
    "comments.user",
    "email firstName",
  );
  //if articles not found
  if (articles.length === 0) {
    return res.status(200).json({ message: "no articles", payload: [] });
  }
  //respond
  res
    .status(200)
    .json({ message: "list of articles are :", payload: articles });
});

// add comments
userRoute.put("/articles", verifyToken("USER"), async (req, res) => {
  const { user, articleId, comment } = req.body;
  // check user

  // // if (user !== req.user.userid) {
  //   return res.status(403).json({ message: "Forbidden" });
  // }

  let articleWithComment = await ArticleModel.findOneAndUpdate(
    { _id: articleId, isArticleActive: true },
    { $push: { comments: { user: req.user.userId, comment } } },
    { new: true, runValidators: true },
  ).populate("comments.user", "email firstName");

  if (!articleWithComment) {
    return res.status(404).json({ message: "Article not found" });
  }

  res.status(200).json({
    message: "comment added successfully",
    payload: articleWithComment,
  });
});
