import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    productCode: {
      type: String,
      unique: true,
      required: true,
    },

    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      original: {
        type: Number,
        required: true,
      },
      discounted: {
        type: Number,
        required: true,
      },
      discountPercent: {
        type: Number,
        required: true,
      },
    },

    image: {
      type: [String],
      required: true,
    },

    category: {
      type: String,
      required: true,
    },

    subCategory: {
      type: String,
      required: true,
    },

    type: {
      type: String,
      required: true,
    },

    sizes: {
      type: [String],
      required: true,
    },

    bestseller: {
      type: Boolean,
      default: false,
    },

    fewItemsLeft: {
      type: Boolean,
      default: false,
    },

    inStock: {
      type: Boolean,
      default: true,
    },

    // ✅ ADD THIS FIELD
    isActive: {
      type: Boolean,
      default: true,
    },

    isHidden: {
  type: Boolean,
  default: false,
},

    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

const Product =
  mongoose.models.Product || mongoose.model("Product", ProductSchema);

export default Product;