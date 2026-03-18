import express from "express";
import adminAuth from "../middleware/adminAuth.middleware.js";
import {
  addCategory,
  addSubCategory,
  addType,
  toggleCategoryHide,        // ✅ correct name (not toggleCategory)
  listCategories,
  listCategoriesPublic,
  toggleSubCategoryHide,
  toggleTypeHide,
  deleteCategory,
  deleteSubCategory,
  deleteType,
} from "../controllers/category.controller.js";

const categoryRouter = express.Router();

// ========== ADMIN ROUTES ==========

// ➕ Add
categoryRouter.post("/add", adminAuth, addCategory);
categoryRouter.post("/add-subcategory", adminAuth, addSubCategory);
categoryRouter.post("/add-type", adminAuth, addType);

// 👁️ Toggle visibility (hide/unhide)
categoryRouter.patch("/:categoryId/toggle", adminAuth, toggleCategoryHide);
categoryRouter.patch(
  "/:categoryId/subcategory/:subCategoryId/toggle",
  adminAuth,
  toggleSubCategoryHide
);
categoryRouter.patch(
  "/:categoryId/subcategory/:subCategoryId/type/:typeId/toggle",
  adminAuth,
  toggleTypeHide
);

// 🗑 Delete
categoryRouter.delete("/:categoryId", adminAuth, deleteCategory);
categoryRouter.delete(
  "/:categoryId/subcategory/:subCategoryId",
  adminAuth,
  deleteSubCategory
);
categoryRouter.delete(
  "/:categoryId/subcategory/:subCategoryId/type/:typeId",
  adminAuth,
  deleteType
);

// 🧾 List
categoryRouter.get("/list", adminAuth, listCategories);

// 🌐 Public (frontend)
categoryRouter.get("/public-list", listCategoriesPublic);

export default categoryRouter;