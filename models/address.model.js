import mongoose from "mongoose";

const addressSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: String,
    phone: String,
    pincode: String,
    locality: String,
    address: String,
    city: String,
    state: String,
    landmark: String,
    altPhone: String,
    type: {
      type: String,
      enum: ["Home", "Work"],
      default: "Home",
    },

    isCurrent: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const Address =
  mongoose.models.Address || mongoose.model("Address", addressSchema);
