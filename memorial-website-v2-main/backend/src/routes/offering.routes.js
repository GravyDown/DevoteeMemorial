import express from "express";
import {
  createOffering,
  getOfferingsByProfile
} from "../controllers/offering.controller.js";

import { upload } from "../middlewares/multer.middleware.js";

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

export default router;
