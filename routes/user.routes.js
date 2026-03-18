import express from "express";
import {
  registerUser,
  loginUser,
  adminLogin,
  googleLogin,
  toggleFavourite,
  getUserFavourites,
  getProfile,
  updateProfile,
  upload, // <-- import multer upload from controller
} from "../controllers/user.controller.js";

import authMiddleware from "../middleware/authUser.middleware.js";

const userRouter = express.Router();

/* ================= AUTH ROUTES ================= */
userRouter.post("/register", registerUser);
userRouter.post("/login", loginUser);
userRouter.post("/google-login", googleLogin);

/* ================= ADMIN ROUTE ================= */
userRouter.post("/admin", adminLogin);

/* ================= PROFILE ROUTES ================= */

// Get logged-in user profile
userRouter.get("/profile", authMiddleware, getProfile);

// Update logged-in user profile with avatar upload
userRouter.put("/profile", authMiddleware, upload.single("avatar"), updateProfile);

/* ================= FAVOURITE ROUTES ================= */

// Toggle favourite (add / remove)
userRouter.post("/favourite", authMiddleware, toggleFavourite);

// Get all favourites of logged-in user
userRouter.get("/favourites", authMiddleware, getUserFavourites);

export default userRouter;
