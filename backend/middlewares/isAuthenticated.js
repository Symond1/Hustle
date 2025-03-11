import jwt from "jsonwebtoken";
import User from "../models/user.model.js";

const isAuthenticated = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      const authorizationHeader = req.headers.authorization;
      const token = authorizationHeader && authorizationHeader.split(" ")[1];

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "No token provided. User not authenticated.",
        });
      }

      jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
        if (err) {
          if (err instanceof jwt.TokenExpiredError) {
            return res.status(401).json({
              success: false,
              message: "Token has expired. Please log in again.",
            });
          } else if (err instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({
              success: false,
              message: "Invalid token. Please log in again.",
            });
          }
          return res.status(500).json({
            success: false,
            message: "Token verification failed. Please try again later.",
          });
        }

        const userId = decoded.userId; // Ensure the field matches your JWT payload
        const user = await User.findById(userId).select("_id role");

        if (!user) {
          return res.status(401).json({
            success: false,
            message: "User not found. Please log in again.",
          });
        }

        req.user = {
          _id: user._id,
          role: user.role.toLowerCase(), 
        };

        const lowerCaseAllowedRoles = allowedRoles?.map(role => role.toLowerCase()) || [];
        if (!lowerCaseAllowedRoles.includes(req.user.role)) {
          return res.status(403).json({
            success: false,
            message: "You are not authorized to perform this action.",
          });
        }

        next();
      });
    } catch (error) {
      console.error("Authentication error:", error);
      return res.status(500).json({
        success: false,
        message: "Server error, please try again.",
      });
    }
  };
};

export default isAuthenticated;