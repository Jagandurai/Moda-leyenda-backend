import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        productCode: String,
        name: String,
        size: String,
        quantity: Number,
        price: Number,
      },
    ],

    totalQuantity: Number,

    amount: {
      type: Number,
      required: true,
    },

    shippingCharge: {
      type: Number,
      default: 0,
    },

    discountAmount: {
      type: Number,
      default: 0,
    },

    address: {
      type: Object,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Order Placed",
        "Packing",
        "Shipped",
        "Out for delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Order Placed",
    },

    statusHistory: [
      {
        status: String,
        updatedAt: { type: Date, default: Date.now },
      },
    ],

    paymentMethod: {
      type: String,
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
  },
  { timestamps: true }
);

// ✅ Named export for consistency
export const Order =
  mongoose.models.Order || mongoose.model("Order", OrderSchema);