import validator from "validator";
import { User } from "../models/user.models.js";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import cloudinary from "../config/cloudinary.js"; // updated path
import multer from "multer";

/* ================= GOOGLE CLIENT ================= */
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* ================= TOKEN GENERATOR ================= */
const generateAccessAndRefreshToken = (userId) => {
  const accessToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

  return { accessToken, refreshToken };
};

/* ================= MULTER SETUP ===f============== */
const storage = multer.memoryStorage();
export const upload = multer({ storage }); // use this in your route

/* ================= REGISTER ================= */
const registerUser = async (req, res) => {
  try {
    console.log("REGISTER BODY:", req.body)
    const { name, email, password } = req.body;

    if ([name, email, password].some((f) => !f || f.trim() === "")) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email address" });
    }

    if (password.length < 8) {
      return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    }

    const existedUser = await User.findOne({ email });
    if (existedUser) {
      return res.status(409).json({ success: false, message: "User already exists" });
    }

    const user = await User.create({ name, email, password });

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id);
    const createdUser = await User.findById(user._id).select("-password");

    res.status(201).json({ success: true, message: "User registered successfully", user: createdUser, accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= LOGIN ================= */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email });

    if (!user || user.isGoogleUser) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const isPasswordValid = await user.isPasswordCorrect(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id);
    const loggedInUser = await User.findById(user._id).select("-password");

    res.status(200).json({ success: true, message: "Login successful", user: loggedInUser, accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GOOGLE LOGIN ================= */
const googleLogin = async (req, res) => {
  try {
    const { token } = req.body;

    const ticket = await googleClient.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    const { email, name, picture } = ticket.getPayload();

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({ name, email, avatar: picture, isGoogleUser: true });
    }

    const { accessToken, refreshToken } = generateAccessAndRefreshToken(user._id);

    res.status(200).json({ success: true, accessToken, refreshToken });
  } catch (error) {
    console.error(error);
    res.status(401).json({ success: false, message: "Google authentication failed" });
  }
};

/* ================= ADMIN LOGIN ================= */
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
      const token = jwt.sign({ email, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: "24h" });
      return res.json({ success: true, message: "Admin login successful", token });
    }

    res.status(401).json({ success: false, message: "Invalid admin credentials" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET USER PROFILE ================= */
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");

    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    res.json({ success: true, user });
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= UPDATE PROFILE ================= */
const updateProfile = async (req, res) => {
  try {
    console.log("Incoming request body:", req.body);
    console.log("Incoming file:", req.file);

    const { name, gender, phone, countryCode } = req.body;
    let avatar;

    // Upload image to Cloudinary if file exists
    if (req.file) {
      const streamifier = (await import("streamifier")).default;
      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile_images" },
          (error, result) => {
            if (error) reject(error);
            else {
              avatar = result.secure_url;
              resolve();
            }
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    if (name) user.name = name;
    if (gender) user.gender = gender;
    if (phone) user.phone = phone;
    if (countryCode) user.countryCode = countryCode;
    if (avatar) user.avatar = avatar;

    console.log("Updated user object before save:", user);

    await user.save();

    const updatedUser = await User.findById(user._id).select("-password");

    console.log("Updated user after save:", updatedUser);

    res.json({ success: true, message: "Profile updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= TOGGLE FAVOURITE ================= */
const toggleFavourite = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ success: false, message: "Product ID is required" });

    const user = await User.findById(userId);

    if (user.favourites.includes(productId)) user.favourites.pull(productId);
    else user.favourites.push(productId);

    await user.save();

    res.json({ success: true, favourites: user.favourites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= GET USER FAVOURITES ================= */
const getUserFavourites = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favourites");
    res.json({ success: true, favourites: user.favourites });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ================= EXPORTS ================= */
export {
  registerUser,
  loginUser,
  googleLogin,
  adminLogin,
  getProfile,
  updateProfile,
  toggleFavourite,
  getUserFavourites,
};
