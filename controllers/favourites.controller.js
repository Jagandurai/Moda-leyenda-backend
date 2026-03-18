import { User } from "../models/user.models.js";

// GET all favourites
export const getFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favourites");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, favourites: user.favourites });
  } catch (err) {
    console.error("Get favourites error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch favourites" });
  }
};

// TOGGLE favourite
export const toggleFavourite = async (req, res) => {
  const { productId } = req.body;
  if (!productId) return res.status(400).json({ success: false, message: "Product ID required" });

  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    const index = user.favourites.indexOf(productId);
    if (index > -1) {
      user.favourites.splice(index, 1); // remove
    } else {
      user.favourites.push(productId); // add
    }

    await user.save();
    await user.populate("favourites");

    res.json({ success: true, favourites: user.favourites });
  } catch (err) {
    console.error("Toggle favourite error:", err);
    res.status(500).json({ success: false, message: "Failed to toggle favourite" });
  }
};
