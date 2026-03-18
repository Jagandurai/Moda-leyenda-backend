import cloudinary from "../config/cloudinary.js";
import mongoose from "mongoose";
import fs from "fs";
import Product from "../models/product.models.js"; // ✅ Default export

// ---------------- Generate Unique Product Code ----------------
const generateProductCode = async (name) => {
  const prefix = name.slice(0, 3).toUpperCase();
  let code;
  let exists = true;

  while (exists) {
    let randomNumber = Math.floor(Math.random() * 100000);
    let paddedNumber = randomNumber.toString().padStart(5, "0");
    code = `${prefix}${paddedNumber}`;
    exists = await Product.findOne({ productCode: code });
  }

  return code;
};

// ---------------- Add Product ----------------
const addProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      subCategory,
      sizes,
      type,
      bestseller,
      fewItemsLeft,
      price,
      inStock,
    } = req.body;

    console.log("🟡 RAW req.body:", req.body);

    if (!name || !description || !category || !subCategory || !price) {
      return res.json({ success: false, message: "All required fields must be filled" });
    }

    // ---------------- Price Parsing ----------------
    let priceObj = { original: 0, discounted: 0, discountPercent: 0 };
    try {
      priceObj = typeof price === "string" ? JSON.parse(price) : price;
      priceObj.original = Number(priceObj.original);
      priceObj.discounted = Number(priceObj.discounted);
      priceObj.discountPercent = Number(priceObj.discountPercent);

      if (isNaN(priceObj.original) || isNaN(priceObj.discounted)) {
        return res.json({ success: false, message: "Invalid price values" });
      }
    } catch (err) {
      console.log("🔴 Price parse error:", err);
      return res.json({ success: false, message: "Invalid price format" });
    }

    // ---------------- Images ----------------
    const imageFiles = [
      req.files?.image1?.[0],
      req.files?.image2?.[0],
      req.files?.image3?.[0],
      req.files?.image4?.[0],
    ].filter(Boolean);

    if (!imageFiles.length) {
      return res.json({ success: false, message: "At least one image is required" });
    }

    const imageUrls = [];
    for (const file of imageFiles) {
      try {
        const result = await cloudinary.uploader.upload(file.path, {
          resource_type: "image",
          folder: "products",
        });
        imageUrls.push(result.secure_url);
      } catch (err) {
        console.log("🔴 Cloudinary upload error:", err);
      } finally {
        fs.unlink(file.path, () => {});
      }
    }

    // ---------------- Boolean Conversion ----------------
    const fewItemsLeftBoolean = fewItemsLeft === "true" || fewItemsLeft === true;
    const bestsellerBoolean = bestseller === "true" || bestseller === true;
    const inStockBoolean = inStock === "false" || inStock === false ? false : true;

    // ---------------- Generate Product Code ----------------
    const productCode = await generateProductCode(name);

    // ---------------- Create Product ----------------
    const product = new Product({
      name: name.toString(),
      description: description.toString(),
      category: category.toString(),
      subCategory: subCategory.toString(),
      type: type ? type.toString() : "", // ✅ Ensure `type` is stored
      sizes: sizes ? JSON.parse(sizes) : [],
      bestseller: bestsellerBoolean,
      fewItemsLeft: fewItemsLeftBoolean,
      inStock: inStockBoolean,
      price: priceObj,
      image: imageUrls,
      productCode,
      date: new Date(),
    });

    await product.save();

    console.log("✅ SAVED PRODUCT:", product);

    res.json({ success: true, message: "Product added successfully", product });
  } catch (error) {
    console.log("🔴 Add product error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Remove Product ----------------
const removeProduct = async (req, res) => {
  try {
    const { id } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }

    res.json({ success: true, message: "Product removed successfully" });
  } catch (error) {
    console.log("🔴 Remove product error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Toggle Few Items Left ----------------
const toggleFewItemsLeft = async (req, res) => {
  try {
    const { productId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res.json({ success: false, message: "Product not found" });

    const newStatus = status === "true" || status === true;
    product.fewItemsLeft = newStatus;

    // ✅ If Few Items = TRUE → Force In Stock = TRUE
    if (newStatus === true) {
      product.inStock = true;
    }

    await product.save();

    res.json({
      success: true,
      message: newStatus
        ? "Marked as Few Items Left"
        : "Removed Few Items Left",
      product,
    });
  } catch (error) {
    console.log("Toggle Few Items Left error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Toggle Bestseller ----------------
const toggleBestseller = async (req, res) => {
  try {
    const { productId, status } = req.body;

    console.log("🔹 TOGGLE TOPSELLING PAYLOAD:", req.body);

    if (!productId)
      return res.status(400).json({ success: false, message: "Product ID required" });

    const product = await Product.findById(productId);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    if (!product.productCode) {
      product.productCode = `${product.name
        .slice(0, 3)
        .toUpperCase()}${Math.floor(Math.random() * 90000 + 10000)}`;
    }

    const newStatus = status === "true" || status === true;
    product.bestseller = newStatus;
    await product.save();

    return res.json({ success: true, message: "Top Selling status updated", product });
  } catch (error) {
    console.error("TOGGLE TOPSELLING ERROR:", error);
    return res.status(500).json({ success: false, message: error.message, error });
  }
};

// ---------------- Toggle In Stock ----------------
const toggleInStock = async (req, res) => {
  try {
    const { productId, status } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findOne({
     _id: productId,
     isHidden: false,
    });

    if (!product)
      return res.json({ success: false, message: "Product not found" });

    const newStatus = status === "true" || status === true;
    product.inStock = newStatus;

    // ✅ If Out of Stock → remove Few Items
    if (newStatus === false) {
      product.fewItemsLeft = false;
    }

    await product.save();

    res.json({
      success: true,
      message: newStatus
        ? "Marked as In Stock"
        : "Marked as Out of Stock",
      product,
    });
  } catch (error) {
    console.log("Toggle In Stock error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Update Product Price ----------------
const updateProductPrice = async (req, res) => {
  try {
    const { productId, price } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.json({ success: false, message: "Invalid product ID" });
    }

    if (price === undefined || isNaN(price)) {
      return res.json({ success: false, message: "Invalid price value" });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res.json({ success: false, message: "Product not found" });

    product.price.discounted = Number(price);
    await product.save();

    res.json({
      success: true,
      message: "Price updated successfully",
      price: product.price.discounted,
    });
  } catch (error) {
    console.log("Update price error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ---------------- List Products----------------
const listProducts = async (req, res) => {
  try {
    const {
      category,
      subCategory,
      type,
      bestseller,
      inStock,
      minPrice,
      maxPrice,
    } = req.query;

let filter = {
  $or: [
    { isHidden: false },
    { isHidden: { $exists: false } }
  ]
};
    // Category filter
    if (category) {
      filter.category = category;
    }

    // SubCategory filter
    if (subCategory) {
      filter.subCategory = subCategory;
    }

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Bestseller filter
    if (bestseller !== undefined) {
      filter.bestseller = bestseller === "true";
    }

    // InStock filter
    if (inStock !== undefined) {
      filter.inStock = inStock === "true";
    }

    // Price range filter
    if (minPrice || maxPrice) {
      filter["price.discounted"] = {};

      if (minPrice) {
        filter["price.discounted"].$gte = Number(minPrice);
      }

      if (maxPrice) {
        filter["price.discounted"].$lte = Number(maxPrice);
      }
    }

    console.log("🟢 Applied Filter:", filter);

    const products = await Product.find(filter);

    res.json({ success: true, products });
  } catch (error) {
    console.log("List Products error:", error);
    res.json({ success: false, message: error.message });
  }
};

// ---------------- Toggle Hide Product ----------------
const toggleHideProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res.json({ success: false, message: "Product not found" });

    product.isHidden = !product.isHidden;
    await product.save();

    res.json({
      success: true,
      message: product.isHidden
        ? "Product hidden successfully"
        : "Product unhidden successfully",
      product,
    });
  } catch (error) {
    console.log("Toggle Hide error:", error);
    res.json({ success: false, message: error.message });
  }
};


// ---------------- Single Product ----------------
const singleProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.json({ success: false, message: "Invalid product ID" });
    }

    const product = await Product.findById(productId);
    if (!product)
      return res.json({ success: false, message: "Product not found" });

    res.json({ success: true, product });
  } catch (error) {
    console.log("Single Product error:", error);
    res.json({ success: false, message: error.message });
  }
};

export {
  addProduct,
  listProducts,
  removeProduct,
  singleProduct,
  toggleFewItemsLeft,
  updateProductPrice,
  toggleBestseller,
  toggleInStock,
  toggleHideProduct, 
};