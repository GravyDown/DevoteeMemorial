import express from "express";
import { 
  registerUser, 
  loginUser, 
  logoutUser, 
  getUserProfile, 
  updateUserProfile,
  googleLogin,
  verifyResetIdentity,   // ← ADD
  resetPassword,
} from "../controllers/user.controller.js";
import { authenticateToken, requireAdmin } from '../middlewares/auth.middleware.js';

const router = express.Router();

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.post("/google", googleLogin);
router.post("/verify-identity", verifyResetIdentity);
router.post("/reset-password", resetPassword);

// Protected routes
router.use(authenticateToken); // Apply authentication middleware to routes below
router.get("/profile", getUserProfile);
router.patch("/profile", updateUserProfile);

export default router;