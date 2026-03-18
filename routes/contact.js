import express from "express";
import sendEmail from "../utils/sendEmail.js"; // path to your Nodemailer code

const router = express.Router();

router.post("/send", async (req, res) => {
  const { firstName, lastName, email, phone, message } = req.body;

  if (!firstName || !lastName || !email || !message) {
    return res.status(400).json({ success: false, message: "All fields are required" });
  }

  const emailText = `
    Name: ${firstName} ${lastName}
    Email: ${email}
    Phone: ${phone || "N/A"}
    
    Message:
    ${message}
  `;

  try {
    await sendEmail({
      to: "djagan5656@gmail.com", // your email
      subject: `New Contact Form Submission from ${firstName} ${lastName}`,
      text: emailText,
    });

    res.status(200).json({ success: true, message: "Message sent successfully" });
  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
});

export default router;