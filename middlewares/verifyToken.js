import jwt from "jsonwebtoken";
import { config } from "dotenv";
import { UserTypeModel } from "../models/UserTypeModel.js";

config();

export const verifyToken = (...allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Read token from cookie
      const token = req.cookies.token;
      if (!token) {
        return res.status(401).json({ message: "Unauthorized. Please login" });
      }

      // Verify and decode token
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

      // 3. Role check (ONLY if roles are provided)
      if (!allowedRoles.includes(decodedToken.role)) {
        return res.status(403).json({
          message: "Forbidden. You don't have permission",
        });
      }

      // 4. Check if user still exists & active
      const user = await UserTypeModel.findById(decodedToken.userId);

      if (!user || !user.isActive) {
        return res.status(403).json({
          message: "User account is blocked or not found",
        });
      }

      // Attach user info to req for use in routes
      req.user = decodedToken;

      next();
    } catch (err) {
      // jwt.verify throws if token is invalid/expired
      if (err.name === "TokenExpiredError") {
        return res
          .status(401)
          .json({ message: "Session expired. Please login again" });
      }
      if (err.name === "JsonWebTokenError") {
        return res
          .status(401)
          .json({ message: "Invalid token. Please login again" });
      }
      // next(err);
    }
  };
};
