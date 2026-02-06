import fs from "fs";
import { Offering } from "../models/offering.models.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";

export const createOffering = asyncHandler(async (req, res) => {
  // ✅ SAFE destructuring
  const { devoteeId, message, relation, videoLink } = req.body || {};

  if (!devoteeId || !message) {
    throw new ApiError(400, "Devotee and message are required");
  }

  const imageUrls = [];
  const audioUrls = [];

  /* ---------- Images ---------- */
  if (req.files?.images) {
    for (const file of req.files.images) {
      const result = await uploadToCloudinary(
        file.path,
        "iskcon/offerings/images",
        "image"
      );

      if (result?.secure_url) {
        imageUrls.push(result.secure_url);
      }

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  /* ---------- Audios ---------- */
  if (req.files?.audios) {
    for (const file of req.files.audios) {
      const result = await uploadToCloudinary(
        file.path,
        "iskcon/offerings/audios",
        "video"
      );

      if (result?.secure_url) {
        audioUrls.push(result.secure_url);
      }

      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
  }

  const offering = await Offering.create({
    profile: devoteeId,
    message,
    relation,
    images: imageUrls,
    audios: audioUrls,
    videoLink,
  });

  res.status(201).json({
    success: true,
    offering,
  });
});

export const getOfferingsByProfile = asyncHandler(async (req, res) => {
  const { profileId } = req.params;

  const offerings = await Offering.find({
    profile: profileId
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    offerings,
  });
});


