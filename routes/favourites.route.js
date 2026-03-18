import express from "express";
import { getFavourites, toggleFavourite } from "../controllers/favourites.controller.js";
import authUser from "../middleware/authUser.middleware.js"; // Fixed import

const router = express.Router();

// Get all favourites
router.get("/get", authUser, getFavourites);

// Toggle favourite
router.post("/toggle", authUser, toggleFavourite);

export default router;
