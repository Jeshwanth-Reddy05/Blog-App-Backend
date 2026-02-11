import exp from "express";
import { register, authenticate } from "../Services/authService.js";
import { UserTypeModel } from "../models/UserTypeModel.js";
import { ArticleModel } from "../models/ArticleModel.js";
import { checkAuthor } from "../middlewares/checkAuthor.js";
import { verifyToken } from "../middlewares/verifyToken.js";
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
authorRoute.post("/articles",verifyToken,checkAuthor, async (req, res) => {
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
authorRoute.get("/articles/:authorId",verifyToken,checkAuthor, async (req, res) => {
  //get author id
  let authorId = req.params.authorId;
  //chcek the author by middleware
  //read articles by this athor
  let allArticles = await ArticleModel.find({
    author: authorId,
    isArticleActive: true,
  }).populate("author", "firstName email");
  //send res
  res.status(200).json({ message: "articles of author", payload: allArticles });
});

//edit article(protected route)
authorRoute.put("/articles", verifyToken,checkAuthor, async (req, res) => {
  //get modified article from request
  let { articleId, title, category, content, author } = req.body;
  //find article
  let ArticleOfDB = await ArticleModel.findOne({
    _id: articleId,
    author: author,
  });
  if (!ArticleOfDB) {
    return res.status(401).json({ message: "article not found" });
  }
  //update the article
  let updateArticle = await ArticleModel.findByIdAndUpdate(
    articleId,
    {
      $set: { title, category, content },
    },
    { new: true, runValidators: true },
  );
  //send response
  res.status(200).json({ message: "updated article", payload: updateArticle });
});

//delete article(soft delete)(protected route)
authorRoute.delete("/articles",verifyToken,checkAuthor, async (req, res) => {
  //get modified article from request
  let article = req.body;
  //find article
  let ArticleOfDB = await ArticleModel.findOne({
    _id: article.articleId,
    author: article.author,
  });
  if (!ArticleOfDB) {
    return res.status(401).json({ message: "article not found" });
  }

  //update the article
  let updateArticle = await ArticleModel.findByIdAndUpdate(
    article.articleId,

    {
      $set: { isArticleActive: false },
    },
    { new: true, runValidators: true },
  );
  res
    .status(200)
    .json({ message: "article is deleted", payload: updateArticle });
});
