import { UserTypeModel } from "../models/UserTypeModel.js";
import jwt from "jsonwebtoken";
import { hash, compare } from "bcryptjs";

export const register = async (userObj) => {
  //create document
  const userDoc = new UserTypeModel(userObj);
  //validate for empty password
  await userDoc.validate();
  //hash the password and replace
  userDoc.password = await hash(userDoc.password, 10);
  //save
  const created = await userDoc.save();
  //convet doc to obj to remove password
  const newUserObj = created.toObject();
  //remove password
  delete newUserObj.password;
  //return user object with password
  return newUserObj;
};

//authenticate function
export const authenticate = async ({ email, password }) => {
  //check user with email and role
  const user = await UserTypeModel.findOne({ email });
  if (!user) {
    const err = new Error("inavalid email ");
    err.status = 401;
    throw err;
  }
  //if user vaild , but blocked by admin

  //compare password
  const isMatch = await compare(password, user.password);
  if (!isMatch) {
    const err = new Error("inavalid password");
    err.status = 401;
    throw err;
  }
  //is active or not
  if (user.isActive === false) {
    const err = new Error("your account is blocked . please contcat admin");
    err.status = 403;
    throw err;
  }
  //generate token
  const token = jwt.sign(
    {
      userId: user._id,
      role: user.role,
      email: user.email,
      profileImageUrl: user.profileImageUrl,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1h",
    },
  );
  const userObj = user.toObject();
  delete userObj.password;
  return { token, user: userObj };
};
