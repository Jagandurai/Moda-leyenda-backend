import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

/* ================= ADDRESS SUB SCHEMA ================= */
const AddressSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    phone: {
      type: String,
      required: true,
    },

    pincode: {
      type: String,
      required: true,
    },

    locality: {
      type: String,
      default: "",
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    state: {
      type: String,
      required: true,
    },

    landmark: {
      type: String,
      default: "",
    },

    altPhone: {
      type: String,
      default: "",
    },

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

/* ================= USER SCHEMA ================= */
const UserSchema = new mongoose.Schema(
  {
    /* ================= BASIC INFO ================= */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    /* ================= AUTH ================= */
    password: {
      type: String,
      required: function () {
        return !this.isGoogleUser;
      },
    },

    isGoogleUser: {
      type: Boolean,
      default: false,
    },

    /* ================= PROFILE ================= */
    avatar: {
      type: String,
      default: "",
    },

    // ✅ FIXED GENDER FIELD
    gender: {
      type: String,
      enum: ["male", "female", "others"],
      default: null, // ← FIXED (was "")
    },

    phone: {
      type: String,
      default: "",
    },

    countryCode: {
      type: String,
      default: "",
    },

    /* ================= ADDRESS MANAGEMENT ================= */
    addresses: [AddressSchema],

    /* ================= CART ================= */
    cartData: {
      type: Object,
      default: {},
    },

    /* ================= FAVOURITES ================= */
    favourites: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],
  },
  {
    timestamps: true,
    minimize: false,
  }
);

/* ================= PASSWORD HASH ================= */
UserSchema.pre("save", async function () {
  if (!this.password) return;
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});

/* ================= PASSWORD CHECK ================= */
UserSchema.methods.isPasswordCorrect = async function (password) {
  if (!this.password) return false;
  return await bcrypt.compare(password, this.password);
};

/* ================= ACCESS TOKEN ================= */
UserSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

/* ================= REFRESH TOKEN ================= */
UserSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User =
  mongoose.models.User || mongoose.model("User", UserSchema);