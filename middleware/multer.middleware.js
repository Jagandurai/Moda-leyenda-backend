// import express from "express";
// import { upload } from "./multer.middleware.js";
// import { uploadToCloudinary } from "./cloudinary.js";

// const router = express.Router();

// router.post("/upload", upload.single("image"), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ message: "No file uploaded" });
//     }

//     const result = await uploadToCloudinary(req.file.buffer);

//     res.status(200).json({
//       message: "Upload successful",
//       url: result.secure_url,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       message: "Upload failed",
//       error: error.message,
//     });
//   }
// });

// export default router;


import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB (change if needed)
});
