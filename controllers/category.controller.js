import Category from "../models/category.model.js";
import mongoose from "mongoose";

// ===============================
// ADD CATEGORY
// ===============================
export const addCategory = async (req, res) => {
  try {
    const { name } = req.body;

    const existing = await Category.findOne({ name });
    if (existing)
      return res.json({ success: false, message: "Category already exists" });

    const category = new Category({ name });
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ===============================
// ADD SUBCATEGORY
// ===============================
export const addSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryName } = req.body;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.json({ success: false, message: "Category not found" });

    // prevent duplicate subcategory name
    if (category.subCategories.some((s) => s.name === subCategoryName)) {
      return res.json({ success: false, message: "SubCategory already exists" });
    }

    category.subCategories.push({ name: subCategoryName, types: [] });
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ===============================
// ADD TYPE
// ===============================
export const addType = async (req, res) => {
  try {
    const { categoryId, subCategoryId, typeName } = req.body;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.json({ success: false, message: "Category not found" });

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory)
      return res.json({ success: false, message: "SubCategory not found" });

    if (subCategory.types.some((t) => t.name === typeName)) {
      return res.json({ success: false, message: "Type already exists" });
    }

    subCategory.types.push({ name: typeName });
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ===============================
// TOGGLE CATEGORY HIDE
// ===============================
// export const toggleCategory = async (req, res) => {
//   try {
//     const { categoryId } = req.body;

//     const category = await Category.findById(categoryId);
//     if (!category)
//       return res.json({ success: false, message: "Category not found" });

//     category.isHidden = !category.isHidden;
//     await category.save();

//     res.json({ success: true, category });
//   } catch (error) {
//     res.json({ success: false, message: error.message });
//   }
// };

// ===============================
// TOGGLE SUBCATEGORY HIDE / UNHIDE
// ===============================


export const toggleSubCategoryHide = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category)
      return res.json({ success: false, message: "Category not found" });

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory)
      return res.json({ success: false, message: "SubCategory not found" });

    subCategory.isHidden = !subCategory.isHidden;

    if (subCategory.isHidden) {
      // Hide all types when subcategory is hidden
      subCategory.types = subCategory.types.map((t) => ({
        ...t.toObject(),
        isHidden: true,
      }));
    } else {
      // ✅ When unhidden, unhide all types
      subCategory.types = subCategory.types.map((t) => ({
        ...t.toObject(),
        isHidden: false,
      }));
    }

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ===============================
// TOGGLE TYPE HIDE / UNHIDE
// ===============================
export const toggleTypeHide = async (req, res) => {
  try {
    const { categoryId, subCategoryId, typeId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.json({ success: false, message: "Category not found" });

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory)
      return res.json({ success: false, message: "SubCategory not found" });

    const type = subCategory.types.id(typeId);
    if (!type)
      return res.json({ success: false, message: "Type not found" });

    type.isHidden = !type.isHidden;

    // if all types are hidden, hide the subcategory
    const allHidden = subCategory.types.every((t) => t.isHidden);
    subCategory.isHidden = allHidden;

    await category.save();
    res.json({ success: true, category });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ===============================
// DELETE SUBCATEGORY
// ===============================
export const deleteSubCategory = async (req, res) => {
  try {
    const { categoryId, subCategoryId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.json({ success: false, message: "Category not found" });

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory)
      return res.json({ success: false, message: "SubCategory not found" });

    subCategory.deleteOne();
    await category.save();

    res.json({ success: true, message: "SubCategory deleted", category });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ===============================
// DELETE TYPE
// ===============================
export const deleteType = async (req, res) => {
  try {
    const { categoryId, subCategoryId, typeId } = req.params;

    const category = await Category.findById(categoryId);
    if (!category)
      return res.json({ success: false, message: "Category not found" });

    const subCategory = category.subCategories.id(subCategoryId);
    if (!subCategory)
      return res.json({ success: false, message: "SubCategory not found" });

    const type = subCategory.types.id(typeId);
    if (!type)
      return res.json({ success: false, message: "Type not found" });

    type.deleteOne();
    await category.save();

    res.json({ success: true, message: "Type deleted", category });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


export const deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findByIdAndDelete(categoryId);
    if (!category)
      return res.json({ success: false, message: "Category not found" });

    res.json({ success: true, message: "Category deleted" });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ✅ Already have toggleCategory via POST, we’ll make it PATCH for frontend consistency
export const toggleCategoryHide = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = await Category.findById(categoryId);
    if (!category)
      return res.json({ success: false, message: "Category not found" });

    category.isHidden = !category.isHidden;
    await category.save();

    res.json({ success: true, category });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};


// ===============================
// ADMIN LIST
// ===============================
export const listCategories = async (req, res) => {
  try {
    const categories = await Category.find({});
    res.json({ success: true, categories });
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};

// ===============================
// ✅ PUBLIC-LIST CATEGORIES FOR USER FRONTEND (CLEAN FILTERED)
// ===============================
export const listCategoriesPublic = async (req, res) => {
  try {
    // Fetch only visible categories first
    const categories = await Category.find({ isHidden: false }).lean();

    // Filter out hidden subcategories & types before sending to frontend
    const filtered = categories.map((cat) => ({
      ...cat,
      subCategories: (cat.subCategories || [])
        .filter((sub) => !sub.isHidden)
        .map((sub) => ({
          ...sub,
          types: (sub.types || []).filter((t) => !t.isHidden),
        })),
    }));

    res.json({ success: true, categories: filtered });
  } catch (error) {
    console.error("Public list error:", error);
    res.json({ success: false, message: error.message });
  }
};