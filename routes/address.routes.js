import express from "express";
import authUser from "../middleware/authUser.middleware.js";
import {
  addAddress,
  getAddresses,
  setCurrentAddress,
  deleteAddress,
} from "../controllers/address.controller.js";

const router = express.Router();

// all address routes are protected
router.get("/", authUser, getAddresses);
router.post("/", authUser, addAddress);
router.patch("/:id/current", authUser, setCurrentAddress);
router.delete("/:id", authUser, deleteAddress);

export default router;
