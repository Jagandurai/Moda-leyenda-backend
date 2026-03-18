import jwt from "jsonwebtoken";

const adminAuth = async (req, res, next) => {
  try {
    console.log("\n========== ADMIN AUTH DEBUG ==========");
    console.log("Headers received:", req.headers);

    const token =
      req.headers.token ||
      req.headers.authorization?.split(" ")[1];

    console.log("Extracted Token:", token);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "User is not authorized, login again",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access only",
      });
    }

    req.adminEmail = decoded.email;
    next();
  } catch (error) {
    console.error("❌ AUTH ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message: error.message, // ← shows "jwt expired"
    });
  }
};

export default adminAuth;
