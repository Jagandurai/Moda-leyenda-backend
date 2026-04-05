import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config(); // ✅ works locally + Vercel (Vercel injects env vars)

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
