import express from "express";
import {
  placeOrderCod,
  allOrders,
  userOrders,
  updateOrderStatus,
} from "../controllers/order.controller.js";
import adminAuth from "../middleware/adminAuth.middleware.js";
import authUser from "../middleware/authUser.middleware.js";
import { Order } from "../models/order.models.js"; // ✅ named import

const orderRouter = express.Router();

// ============================
// ADMIN ROUTES
// ============================

// Get all orders (Admin)
orderRouter.post("/list", adminAuth, allOrders);

// Update order status (Admin)
orderRouter.post("/update-order-status", adminAuth, updateOrderStatus);

// ============================
// USER ROUTES
// ============================

// Place order (COD only)
orderRouter.post("/cod", authUser, placeOrderCod);

// Get user's own orders
orderRouter.post("/userorders", authUser, userOrders);

// Cancel order
orderRouter.post("/cancel", authUser, async (req, res) => {
  const { orderId } = req.body;

  if (!orderId)
    return res.status(400).json({ success: false, message: "Order ID missing" });

  try {
    const order = await Order.findById(orderId);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    if (order.status.toLowerCase() === "cancelled")
      return res.status(400).json({ success: false, message: "Order already cancelled" });

    if (order.status.toLowerCase() === "delivered")
      return res.status(400).json({ success: false, message: "Delivered orders cannot be cancelled" });

    order.status = "Cancelled";
    await order.save();

    return res.json({ success: true, message: "Order cancelled successfully" });
  } catch (err) {
    console.error("Cancel Order Error:", err); // ✅ better logging
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default orderRouter;