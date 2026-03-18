import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";

dotenv.config({ path: "./env" });

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, // match your env
  api_key: process.env.CLOUDINARY_API_KEY,        // match your env
  api_secret: process.env.CLOUDINARY_API_SECRET, // match your env
});

export default cloudinary;
