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
  getAllUsers,
  updateUserRole,
  inviteUser,
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

// Admin-only routes
router.get("/admin/all", requireAdmin, getAllUsers);
router.patch("/admin/:id/role", requireAdmin, updateUserRole);
router.post("/admin/invite", requireAdmin, inviteUser);

export default router;