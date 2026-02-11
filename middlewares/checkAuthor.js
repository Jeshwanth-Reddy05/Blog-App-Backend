import { UserTypeModel } from "../models/UserTypeModel.js";
export const checkAuthor = async (req, res, next) => {
  //get author by id from  body and url
  let authorId = req.body?.author || req.params?.authorId;
  //verify author
  let author = await UserTypeModel.findById(authorId);
  if (!author) {
    return res.status(401).json({ message: "inavalid author" });
  }
  //if author found and role is different
  if( author?.role !== "AUTHOR"){
    return res.status(403).json({ message: "user is not an author" });
  }
  //if author is blocked
  if(!author.isActive){
    return res.status(403).json({ message: "author account is not active" });
  }
  //forward the request
  next();
};
