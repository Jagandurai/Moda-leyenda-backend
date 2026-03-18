import jwt from "jsonwebtoken";
import { User } from "../models/user.models.js";

const authUser = async (req, res, next) => {
  try {
    console.log("🔐 AUTH MIDDLEWARE HIT");

    const authHeader = req.headers.authorization;
    console.log("📥 Authorization Header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("❌ No Bearer token found");
      return res.status(401).json({
        success: false,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];
    console.log("🔑 Token received:", token);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("✅ Token decoded:", decoded);
    } catch (err) {
      console.log("❌ Token verification failed:", err.message);
      return res.status(401).json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    const user = await User.findById(decoded.id);
    console.log("👤 User from DB:", user?._id);

    if (!user) {
      console.log("❌ User not found in DB");
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    req.user = user;
    console.log("✅ Auth success, user attached to req");
    next();
  } catch (error) {
    console.error("🔥 AUTH MIDDLEWARE ERROR:", error);
    return res.status(401).json({
      success: false,
      message: "Authentication failed",
    });
  }
};

export default authUser;
