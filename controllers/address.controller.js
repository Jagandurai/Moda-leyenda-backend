import { User } from "../models/user.models.js";

/* ================= ADD ADDRESS ================= */
export const addAddress = async (req, res) => {
  try {
    console.log("📦 ADD ADDRESS HIT");
    console.log("👤 Logged in user:", req.user._id);
    console.log("📨 Address payload:", req.body);

    const user = await User.findById(req.user._id);

    if (!user) {
      console.log("❌ User not found while saving address");
      return res.status(404).json({ message: "User not found" });
    }

    user.addresses.push({
      ...req.body,
      isCurrent: user.addresses.length === 0,
    });

    await user.save();

    console.log("✅ Address saved successfully");

    res.status(201).json({
      success: true,
      addresses: user.addresses,
    });
  } catch (error) {
    console.error("🔥 ADD ADDRESS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= GET ADDRESSES ================= */
export const getAddresses = async (req, res) => {
  try {
    console.log("📦 GET ADDRESSES HIT");
    console.log("👤 User:", req.user._id);

    const user = await User.findById(req.user._id);

    res.json({
      success: true,
      addresses: user.addresses || [],
    });
  } catch (error) {
    console.error("🔥 GET ADDRESS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= SET CURRENT ================= */
export const setCurrentAddress = async (req, res) => {
  try {
    console.log("⭐ SET CURRENT ADDRESS");
    console.log("Address ID:", req.params.id);

    const user = await User.findById(req.user._id);

    user.addresses.forEach((addr) => {
      addr.isCurrent = addr._id.toString() === req.params.id;
    });

    await user.save();

    console.log("✅ Current address updated");

    res.json({ success: true });
  } catch (error) {
    console.error("🔥 SET CURRENT ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/* ================= DELETE ================= */
export const deleteAddress = async (req, res) => {
  try {
    console.log("🗑️ DELETE ADDRESS:", req.params.id);

    const user = await User.findById(req.user._id);

    user.addresses = user.addresses.filter(
      (addr) => addr._id.toString() !== req.params.id
    );

    await user.save();

    console.log("✅ Address deleted");

    res.json({ success: true });
  } catch (error) {
    console.error("🔥 DELETE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};
