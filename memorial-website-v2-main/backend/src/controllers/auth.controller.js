import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import User from "../models/user.models.js";
import bcrypt from "bcryptjs";

// Use environment variables (fallback only for development)
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@iskcon.org";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "admin123";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_SECRET + "_refresh";

// Generate tokens
function generateAccessToken(user) {
  return jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
}

function generateRefreshToken(user) {
  return jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
}

// Admin Login
export const adminLogin = (req, res) => {
  const { email, password } = req.body;

  if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const user = { email, role: "admin" };

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  // Set cookies
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 15 * 60 * 1000,
    path: "/",
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  res.json({ user });
};

// Refresh Token
export const refreshToken = (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const user = jwt.verify(token, REFRESH_TOKEN_SECRET);

    const newAccessToken = generateAccessToken({
      email: user.email,
      role: user.role,
    });

    res.json({ accessToken: newAccessToken, user });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

// Logout
export const logout = (req, res) => {
  res.clearCookie("accessToken", {
    path: "/",
    sameSite: "none",
    secure: true,
  });

  res.clearCookie("refreshToken", {
    path: "/",
    sameSite: "none",
    secure: true,
  });

  res.json({ message: "Logged out" });
};

// Verify Token
export const verifyToken = (req, res) => {
  const token = req.cookies.accessToken;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: "No access token",
    });
  }

  try {
    const user = jwt.verify(token, ACCESS_TOKEN_SECRET);
    res.json({ success: true, user });
  } catch {
    res.status(401).json({
      success: false,
      error: "Invalid or expired token",
    });
  }
};

// Regular User Login
export const userLogin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const payload = { id: user._id, email: user.email, role: user.role || "user" };

    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
      path: "/",
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.json({ user: payload });

  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};