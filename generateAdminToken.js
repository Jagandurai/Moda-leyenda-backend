// generateAdminToken.js
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const adminPayload = {
  _id: "ADMIN_OBJECT_ID_HERE", // replace with your admin _id from DB
  email: "admin@gmail.com",
  isAdmin: true,
};

// Generate token
const token = jwt.sign(adminPayload, process.env.JWT_SECRET, {
  expiresIn: "7d", // matches ACCESS_TOKEN_EXPIRY
});

console.log("✅ Admin JWT Token:", token);