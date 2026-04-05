import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import uploadRouter from "./routes/upload.route.js";

import connectDB from "./config/mongodb.js";
import "./config/cloudinary.js";

import userRouter from "./routes/user.routes.js";
import productRouter from "./routes/product.route.js";
import cartRouter from "./routes/cart.route.js";
import orderRouter from "./routes/order.route.js";
import favouritesRouter from "./routes/favourites.route.js";
import addressRouter from "./routes/address.routes.js";
import categoryRouter from "./routes/category.route.js";
import cleanupRouter from "./routes/cleanup.route.js";
import contactRoutes from "./routes/contact.js";

// 🔥 IMPORT EMAIL FUNCTION
import sendEmail from "./utils/sendEmail.js";

// Load environment variables
dotenv.config();

// App config
const app = express();
const port = process.env.PORT || 5001;

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());

// ✅ Production + Development CORS Setup
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
  process.env.ADMIN_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);


// ============================
// API routes
// ============================
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/favourites", favouritesRouter);
app.use("/api/addresses", addressRouter);
app.use("/api/category", categoryRouter);
app.use("/api/cleanup", cleanupRouter);
app.use("/api", uploadRouter);
app.use("/api/contact", contactRoutes);

// Root endpoint
app.get("/", (req, res) => {
  res.send("API WORKING");
});

// Start server
app.listen(port, () => {
  console.log(`🚀 Server is running on port: ${port}`);
});
