import { User } from "../models/user.models.js";

// ============================
// ADD TO CART
// ============================
const addToCart = async (req, res) => {
  try {
    const userId = req.user._id; // ← Updated
    const { itemId, size } = req.body;

    if (!userId || !itemId || !size) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let cartData = userData.cartData || {};
    if (!cartData[itemId]) cartData[itemId] = {};
    cartData[itemId][size] = (cartData[itemId][size] || 0) + 1;

    await User.findByIdAndUpdate(userId, { cartData });

    res.status(200).json({
      success: true,
      message: "Added to cart",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// UPDATE CART
// ============================
const updateCart = async (req, res) => {
  try {
    const userId = req.user._id; // ← Updated
    const { itemId, size, quantity } = req.body;

    if (!userId || !itemId || !size) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    let cartData = userData.cartData || {};
    if (!cartData[itemId]) cartData[itemId] = {};

    if (quantity <= 0) {
      delete cartData[itemId][size];
      if (Object.keys(cartData[itemId]).length === 0) {
        delete cartData[itemId];
      }
    } else {
      cartData[itemId][size] = quantity;
    }

    await User.findByIdAndUpdate(userId, { cartData });

    res.status(200).json({
      success: true,
      message: "Cart updated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// GET USER CART
// ============================
const getUserCart = async (req, res) => {
  try {
    const userId = req.user._id; // ← Updated

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userData = await User.findById(userId);
    if (!userData) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      cartData: userData.cartData || {},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export { addToCart, updateCart, getUserCart };
