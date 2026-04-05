import express from "express";
import { upload } from "../middleware/multer.middleware.js";
import { uploadToCloudinary } from "../utils/uploadToCloudinary.js";

const router = express.Router();

router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const result = await uploadToCloudinary(req.file.buffer);

    return res.status(200).json({
      message: "Upload successful",
      url: result.secure_url,
      public_id: result.public_id,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return res.status(500).json({
      message: "Upload failed",
      error: error.message,
    });
  }
});

export default router;
