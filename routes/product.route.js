import express from "express";
import {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct,
  toggleFewItemsLeft,
  toggleBestseller,
  updateProductPrice,
  toggleHideProduct, 
  toggleInStock,        // ✅ ADD THIS
} from "../controllers/product.controller.js";

import { upload } from "../middleware/multer.middleware.js";
import adminAuth from "../middleware/adminAuth.middleware.js";

const productRouter = express.Router();

/* ------------------ ADD PRODUCT ------------------ */
productRouter.post(
  "/add",
  adminAuth,
  upload.fields([
    { name: "image1", maxCount: 1 },
    { name: "image2", maxCount: 1 },
    { name: "image3", maxCount: 1 },
    { name: "image4", maxCount: 1 },
  ]),
  addProduct
);

/* ------------------ REMOVE PRODUCT ------------------ */
productRouter.post("/remove", adminAuth, removeProduct);

/* ------------------ GET SINGLE PRODUCT ------------------ */
productRouter.post("/single", singleProduct);

/* ------------------ LIST PRODUCTS ------------------ */
productRouter.get("/list", listProducts);

/* ------------------ TOGGLE FEW ITEMS ------------------ */
productRouter.post("/toggle-few-items", adminAuth, toggleFewItemsLeft);

/* ------------------ TOGGLE BESTSELLER ------------------ */
productRouter.post("/toggle-bestseller", adminAuth, toggleBestseller);

/* ------------------ TOGGLE IN STOCK ------------------ */
productRouter.post("/toggle-instock", adminAuth, toggleInStock);   // ✅ ADD THIS

/* ------------------ UPDATE PRICE ------------------ */
productRouter.post("/update-price", adminAuth, updateProductPrice);

/* ------------------ TOGGLE HIDE PRODUCT ------------------ */
productRouter.post("/toggle-hide", adminAuth, toggleHideProduct);

export default productRouter;