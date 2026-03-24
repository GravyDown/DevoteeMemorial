import { sendEmail } from "../utils/mailer.js";

// In-memory store (for single-server deployments; use Redis for multi-instance)
const verificationCodes = {};

export const sendVerificationCode = async (req, res) => {
  const { email, name } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required" });

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  verificationCodes[email] = { code, expires: Date.now() + 10 * 60 * 1000 };

  const subject = "Your ISKCON Memorial Verification Code";
  const text = `Dear${name ? " " + name : ""},\n\nYour verification code is: ${code}\n\nThis code will expire in 10 minutes.\n\nHare Krishna!`;
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
      <h2 style="color: #2d7c2d;">ISKCON Memorial Email Verification</h2>
      <p>Dear${name ? " " + name : ""},</p>
      <p>Your verification code is:</p>
      <div style="font-size: 2em; font-weight: bold; color: #e67e22; margin: 16px 0;">${code}</div>
      <p>This code will expire in 10 minutes.</p>
      <p>If you did not request this, please ignore this email.</p>
      <p>Hare Krishna!</p>
    </div>
  `;

  try {
    await sendEmail(email, subject, text, html);
    res.json({ success: true, message: "Verification code sent" });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to send email" });
  }
};

export const verifyCode = (req, res) => {
  const { email, code } = req.body;
  const record = verificationCodes[email];
  if (!record) return res.status(400).json({ success: false, message: "No code sent to this email" });
  if (Date.now() > record.expires) return res.status(400).json({ success: false, message: "Code expired" });
  if (record.code !== code) return res.status(400).json({ success: false, message: "Invalid code" });

  delete verificationCodes[email];
  res.json({ success: true, message: "Email verified" });
};
