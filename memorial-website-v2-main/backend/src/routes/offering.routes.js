import express from "express";
import {
  createOffering,
  getOfferingsByProfile,
  getAllOfferings,
  updateOfferingStatus,
  deleteOffering,
} from "../controllers/offering.controller.js";

import { upload } from "../middlewares/multer.middleware.js";
import { authenticateToken, requireAdmin } from "../middlewares/auth.middleware.js";

const router = express.Router();

/**
 * CREATE OFFERING
 */
router.post(
  "/",
  upload.fields([
    { name: "images", maxCount: 5 },
    { name: "audios", maxCount: 3 }
  ]),
  createOffering
);

/**
 * 🔴 THIS ROUTE WAS MISSING / WRONG
 * GET offerings for a profile
 */
router.get("/profile/:profileId", getOfferingsByProfile);

/**
 * ADMIN MODERATION
 * Note: placed above no dynamic conflicts since "/admin/all" doesn't collide
 * with "/profile/:profileId".
 */
router.get("/admin/all", authenticateToken, requireAdmin, getAllOfferings);
router.patch("/:id/status", authenticateToken, requireAdmin, updateOfferingStatus);
router.delete("/:id", authenticateToken, requireAdmin, deleteOffering);

export default router;