import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();

export const verifyToken = async (req, res, next) => {
  //read token from req
  let token = req.cookies.token; //{token :" "}
  //verify token
  if (token === undefined) {
    res.status(400).json({ message: "Unauthorized request please login" });
  }
  //verfiying the validity of the token(decoding token)

  let decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  //forward
  next();
};
