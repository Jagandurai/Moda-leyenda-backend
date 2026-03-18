import { Order } from "../models/order.models.js";
import { User } from "../models/user.models.js";
import sendEmail from "../utils/sendEmail.js";

// ============================
// PLACE ORDER - COD (Only COD Enabled)
// ============================
const placeOrderCod = async (req, res) => {
  try {
    if (!req.user || !req.user._id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userId = req.user._id;
    const { items, address, shippingCharge = 0 } = req.body;
    console.log("Received Body:", req.body);

    if (!items?.length || !address) {
      return res.status(400).json({
        success: false,
        message: "Items and address are required",
      });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // ================= Normalize items and calculate subtotal =================
    let subtotal = 0;

    const normalizedItems = items.map((item) => {
      const finalPrice =
        typeof item.price === "number"
          ? item.price
          : item.price?.discounted || item.price?.original || 0;

      const quantity = item.quantity || 1;
      subtotal += Number(finalPrice) * quantity;

      return {
        productId: (item._id || item.productId)?.toString() || "N/A",
        productCode: item.productCode || "N/A",  // <-- added productCode
        name: item.name,
        size: item.size,
        quantity,
        price: Number(finalPrice),
      };
    });

    const orderData = {
      userId,
      orderNumber,
      items: normalizedItems,
      subtotal,
      shippingCharge: Number(shippingCharge) || 0,
      amount: subtotal + (Number(shippingCharge) || 0),
      address,
      paymentMethod: "COD",
      paymentStatus: "Pending",
      status: "Order Placed",
      statusHistory: [
        {
          status: "Order Placed",
          date: new Date(),
        },
      ],
    };

    // ================= Save Order =================
    const newOrder = new Order(orderData);
    await newOrder.save();

    // Clear user's cart
    await User.findByIdAndUpdate(userId, { cartData: {} });

    // ===================== Send Email to Admin =====================
    try {
      // Use ENV for admin email!
      const adminEmail = process.env.ADMIN_EMAIL || "djagan5656@gmail.com";

      const emailText = `
A new order has been placed!

Order ID: ${newOrder.orderNumber}
Date & Time: ${new Date(newOrder.createdAt).toLocaleString()}

Customer Name: ${address.name || "N/A"}
Shipping Address:
${address.name || ""}
${address.address || ""}         
${address.city || ""}, ${address.state || ""} - ${address.pincode || ""}
Mobile: ${address.phone || "N/A"}

Items:
${normalizedItems
  .map(
    (item) => `- ${item.name} (Product Code: ${item.productCode || item.productId}) x ${item.quantity}`
  )
  .join("\n")}

Total Amount: ${orderData.amount}

Thanks,
Moda Leyenda
`;

      console.log("Sending order email to admin...");

      await sendEmail({
        to: adminEmail,
        subject: `New Order Placed - ${newOrder.orderNumber}`,
        text: emailText,
        // Optionally, add HTML formatting for nicer email
        html: `<pre>${emailText}</pre>`
      });

      console.log("✅ Admin email sent successfully");
    } catch (emailError) {
      console.error("🔥 Error sending admin email:", emailError);
    }

    // ================= Respond =================
    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order: newOrder,
    });
  } catch (error) {
    console.error("🔥 Error placing COD order:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};


// ============================
// USER ORDERS
// ============================
const userOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userId })
      .populate("items.productId", "productCode _id name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("🔥 Error fetching user orders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// ALL ORDERS - ADMIN
// ============================
const allOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate("userId", "name email phone")
      .populate("items.productId", "productCode _id name image")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.error("🔥 Error fetching all orders:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// UPDATE ORDER STATUS - ADMIN
// ============================
const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required",
      });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;

    order.statusHistory.push({
      status,
      date: new Date(),
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
    });
  } catch (error) {
    console.error("🔥 Error updating order status:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// CANCEL ORDER - USER
// ============================
const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID required" });
    }

    const order = await Order.findById(orderId);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (["Delivered", "Cancelled"].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is ${order.status}`,
      });
    }

    order.status = "Cancelled";

    order.statusHistory.push({
      status: "Cancelled",
      date: new Date(),
    });

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("🔥 Error cancelling order:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================
// EXPORTS
// ============================
export {
  placeOrderCod,
  userOrders,
  allOrders,
  updateOrderStatus,
  cancelOrder,
};