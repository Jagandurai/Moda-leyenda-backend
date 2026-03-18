import express from "express";
import adminAuth from "../middleware/adminAuth.middleware.js";
import { Order } from "../models/order.models.js"; // named import

const cleanupRouter = express.Router();

// ============================
// Delete all orders (admin only)
// ============================
cleanupRouter.delete("/clear-orders", adminAuth, async (req, res) => {
  try {
    const result = await Order.deleteMany({}); // delete all orders
    res.json({
      success: true,
      message: `🧹 Deleted ${result.deletedCount} orders from the database.`,
    });
  } catch (err) {
    console.error("Clear orders error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
});

export default cleanupRouter;