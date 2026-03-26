import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { sendEmail } from "../utils/mailer.js";
import { User } from "../models/user.models.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { OAuth2Client } from "google-auth-library";

const ACCESS_TOKEN_SECRET = process.env.JWT_SECRET;
const REFRESH_TOKEN_SECRET = process.env.JWT_SECRET + "_refresh";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

const generateAccessToken = (user) =>
  jwt.sign(user, ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (user) =>
  jwt.sign(user, REFRESH_TOKEN_SECRET, { expiresIn: "7d" });

// ================= REGISTER =================
export const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password, phone, temple, location, accountType } =
    req.body;

  if (!username || !email || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User with this email already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    username,
    email,
    password: hashedPassword,
    phone: phone || "",
    temple: temple || "",
    location: location || "",
    accountType: accountType || "",
  });

  try {
    await sendEmail(
      email,
      "Welcome to ISKCON Memorial",
      `Dear ${username},\n\nThank you for registering!\n\nHare Krishna!`,
    );
  } catch (err) {
    console.error("Email failed:", err.message);
  }

  res.status(201).json({
    success: true,
    message: "User registered successfully",
  });
});

// ================= LOGIN =================
export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, "Email and password are required");
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) throw new ApiError(401, "Invalid email or password");

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) throw new ApiError(401, "Invalid email or password");

  const payload = {
    id: user._id,
    email: user.email,
    username: user.username,
    role: user.role || "user",
  };

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

  res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: user.role || "user",
    },
  });
});

// ================= REFRESH =================
export const refreshUserToken = async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token) {
    return res.status(401).json({ error: "No refresh token" });
  }

  try {
    const decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);

    const dbUser = await User.findById(decoded.id).select("username email");

    const payload = {
      id: decoded.id,
      email: dbUser?.email || decoded.email,
      username: dbUser?.username,
      role: decoded.role,
    };

    const newAccessToken = generateAccessToken(payload);

    res.json({ accessToken: newAccessToken, user: payload });
  } catch {
    res.status(403).json({ error: "Invalid refresh token" });
  }
};

// ================= LOGOUT =================
export const logoutUser = asyncHandler(async (req, res) => {
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

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

// ================= PROFILE =================
export const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  if (!user) throw new ApiError(404, "User not found");
  res.json({ success: true, user });
});

// ================= UPDATE =================
export const updateUserProfile = asyncHandler(async (req, res) => {
  const { username, email } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) throw new ApiError(404, "User not found");

  if (email && email !== user.email) {
    const exists = await User.findOne({ email });
    if (exists) throw new ApiError(409, "Email already in use");
    user.email = email;
  }

  if (username) user.username = username;

  await user.save();

  res.json({
    success: true,
    message: "Profile updated successfully",
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});

// ================= GOOGLE LOGIN =================
export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    throw new ApiError(400, "Missing Google credential");
  }

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: GOOGLE_CLIENT_ID,
  });

  const payload = ticket.getPayload();

  const {
    sub: googleId,
    email,
    name: username,
    picture,
    email_verified,
    iss,
    aud,
  } = payload || {};

  if (!email_verified) throw new ApiError(401, "Email not verified");
  if (!googleId || !email) throw new ApiError(400, "Invalid token");

  if (aud !== GOOGLE_CLIENT_ID) throw new ApiError(401, "Invalid audience");

  if (iss !== "https://accounts.google.com" && iss !== "accounts.google.com") {
    throw new ApiError(401, "Invalid issuer");
  }

  let user = await User.findOne({ $or: [{ googleId }, { email }] });

  if (!user) {
    user = await User.create({
      username: username || email.split("@")[0],
      email,
      provider: "google",
      googleId,
      picture,
    });
  } else {
    user.googleId = user.googleId || googleId;
    user.provider = user.provider || "google";

    if (picture && !user.picture) user.picture = picture;
    if (!user.username && username) user.username = username;

    await user.save();
  }

  const tokenPayload = {
    id: user._id,
    email: user.email,
    username: user.username,
    role: "user",
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

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

  res.json({
    success: true,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: "user",
    },
  });
});
