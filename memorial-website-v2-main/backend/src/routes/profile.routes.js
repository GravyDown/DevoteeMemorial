import express from "express";
import {
  createProfile,
  getAllProfiles,
  getAllPendingProfiles,
  getProfileById,
  updateProfileStatus,
  deleteProfile,
} from "../controllers/profile.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { Profile } from "../models/profile.models.js";

const router = express.Router();

// Configure multer to accept both cover image and multiple audio files
const uploadFields = [{ name: "coverImage", maxCount: 1 }];

// Dynamically add audio file fields (support up to 10 audio files named audioFile_0 .. audioFile_9)
for (let i = 0; i < 10; i++) {
  uploadFields.push({ name: `audioFile_${i}`, maxCount: 1 });
}

// Create
router.post("/", upload.fields(uploadFields), createProfile);

// Read - list accepted
router.get("/", getAllProfiles);

// Read - pending (admin UI)
router.get("/pending", getAllPendingProfiles);

// Update status (admin)
router.patch("/:id/status", updateProfileStatus);

// Add a single achievement to profile.keyAchievements
router.patch("/:id/achievement", async (req, res) => {
  const { id } = req.params;
  const { achievement } = req.body;
  if (!achievement || typeof achievement !== "string") {
    return res.status(400).json({ success: false, message: "Invalid achievement" });
  }
  try {
    const profile = await Profile.findById(id);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    profile.keyAchievements = profile.keyAchievements || [];
    profile.keyAchievements.push(achievement);
    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Append a timeline event
router.patch("/:id/timeline", async (req, res) => {
  const { id } = req.params;
  const { year, title, event, description } = req.body;
  // accept either 'event' or 'description' as the text for the timeline entry
  if (!year || (!title && !event && !description)) {
    return res.status(400).json({ success: false, message: "Invalid timeline payload" });
  }
  try {
    const profile = await Profile.findById(id);
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });

    profile.timeline = profile.timeline || [];
    profile.timeline.push({ year, title: title || "", event: event || description || "" });
    await profile.save();
    res.json({ success: true, profile });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// Read single
router.get("/:id", getProfileById);

// Delete
router.delete("/:id", deleteProfile);

export default router;