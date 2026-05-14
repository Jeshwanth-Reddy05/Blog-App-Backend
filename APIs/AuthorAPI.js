import exp from "express";
import { register, authenticate } from "../Services/authService.js";
import { UserTypeModel } from "../models/UserTypeModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { checkAuthor } from "../middlewares/checkAuthor.js";
import { verifyToken } from "../middlewares/verifyToken.js";
import mongoose from "mongoose";
export const authorRoute = exp.Router();

//register author(public route)
authorRoute.post("/users", async (req, res) => {
  //get user objects from req
  let userObj = req.body;
  //call register from authService
  const newUserObj = await register({ ...userObj, role: "AUTHOR" });
  //send res
  res.status(201).json({ message: "Author created", payload: newUserObj });
});

//authenticate author or login(public route)
// authorRoute.post("/authenticate", async (req, res) => {
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

//create article (protected route)
authorRoute.post("/articles", verifyToken("AUTHOR"), async (req, res) => {
  //get article from req
  let article = req.body;
  //check if author exists or not by middleware

  //create article document
  let newArticleDoc = new ArticleModel(article);
  //save
  let createdArticleDoc = await newArticleDoc.save();
  //send res
  res
    .status(201)
    .json({ message: "article is created", payload: createdArticleDoc });
});

//read article of author (protected route)
authorRoute.get("/articles", verifyToken("AUTHOR"), async (req, res) => {
  //get author id
  let authorId = req.user.userId;
  //chcek the author by middleware
  //read articles by this athor
  let allArticles = await ArticleModel.find({
    author: authorId,
  }).populate("author", "firstName email");

  //send res
  res.status(200).json({ message: "articles of author", payload: allArticles });
});

//edit article(protected route)
//Edit Article(protected)
authorRoute.put(
  "/articles/:articleId",
  verifyToken("AUTHOR"),
  async (req, res) => {
    //get articleId from URL params
    const { articleId } = req.params;

    //get modified(updated) article from req
    const { title, category, content } = req.body;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({ message: "Invalid article ID" });
    }

    // update article only if:
    // 1) article exists
    // 2) article belongs to logged-in author
    // 3) article is active

    const modifiedArticleDoc = await ArticleModel.findOneAndUpdate(
      {
        _id: articleId,
        author: req.user.userId,
        isArticleActive: true,
      },
      {
        $set: {
          title,
          category,
          content,
        },
      },
      { new: true, runValidators: true },
    );

    if (!modifiedArticleDoc) {
      return res
        .status(404)
        .json({ message: "Article not found or you don't have permission" });
    }

    //send res
    res
      .status(200)
      .json({ message: "Article updated", payload: modifiedArticleDoc });
  },
);

//delete article(soft delete)(protected route)
// authorRoute.patch("/articles", verifyToken("AUTHOR"), checkAuthor, async (req, res) => {
//   //get modified article from request
//   let article = req.body;
//   //find article
//   let ArticleOfDB = await ArticleModel.findOne({
//     _id: article.articleId,
//     author: article.author,
//   });
//   if (!ArticleOfDB) {
//     return res.status(401).json({ message: "article not found" });
//   }
// // login as one author and delete artilces of another author is  not allowed implement a single route for delete and resotre the route based on the active status

//   //update the article
//   let updateArticle = await ArticleModel.findByIdAndUpdate(
//     article.articleId,

//     {
//       $set: { isArticleActive: false },
//     },
//     { new: true, runValidators: true },
//   );
//   res
//     .status(200)
//     .json({ message: "article is deleted", payload: updateArticle });
// });

//delete(soft delete) article(Protected route)
// authorRoute.patch(
//   "/articles/:id/status",
//   verifyToken("AUTHOR"),
//   async (req, res) => {
//     const { id } = req.params;
//     const { isArticleActive } = req.body;
//     // Find article
//     const article = await ArticleModel.findById(id); //.populate("author");
//     //console.log(article)
//     if (!article) {
//       return res.status(404).json({ message: "Article not found" });
//     }

//     //console.log(req.user.userId,article.author.toString())
//     // AUTHOR can only modify their own articles
//     if (
//       req.user.role === "AUTHOR" &&
//       article.author.toString() !== req.user.userId
//     ) {
//       return res
//         .status(403)
//         .json({ message: "Forbidden. You can only modify your own articles" });
//     }
//     // Already in requested state
//     if (article.isArticleActive === isArticleActive) {
//       return res.status(400).json({
//         message: `Article is already ${isArticleActive ? "active" : "deleted"}`,
//       });
//     }

//     //update status
//     article.isArticleActive = isArticleActive;
//     await article.save();

//     //send res
//     res.status(200).json({
//       message: `Article ${isArticleActive ? "restored" : "deleted"} successfully`,
//       article,
//     });
//   },
// );

authorRoute.patch(
  "/articles/:id/status",
  verifyToken("AUTHOR"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { isArticleActive } = req.body;

      const article = await ArticleModel.findById(id);

      if (!article) {
        return res.status(404).json({ message: "Article not found" });
      }

      // AUTHOR can only modify their own articles
      if (
        req.user.role === "AUTHOR" &&
        article.author.toString() !== req.user.userId
      ) {
        return res.status(403).json({
          message: "Forbidden. You can only modify your own articles",
        });
      }

      // Already in requested state
      if (article.isArticleActive === isArticleActive) {
        return res.status(400).json({
          message: `Article is already ${
            isArticleActive ? "active" : "deleted"
          }`,
        });
      }

      // update status
      article.isArticleActive = isArticleActive;
      await article.save();

      res.status(200).json({
        message: `Article ${
          isArticleActive ? "restored" : "deleted"
        } successfully`,
        payload: article,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Server error" });
    }
  },
);
