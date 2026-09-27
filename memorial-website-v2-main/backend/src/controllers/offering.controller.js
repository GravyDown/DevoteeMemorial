import fs from "fs";
import { Offering } from "../models/offering.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
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

/**
 * ADMIN: list all offerings, optionally filtered by status
 * GET /api/offerings/admin/all?status=pending|approved|rejected
 */
export const getAllOfferings = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status && status !== "all" ? { status } : {};

  const offerings = await Offering.find(filter)
    .populate("profile", "name location coverImage")
    .sort({ createdAt: -1 })
    .lean();

  res.json({
    success: true,
    offerings,
  });
});

/**
 * ADMIN: approve or reject an offering
 * PATCH /api/offerings/:id/status
 */
export const updateOfferingStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    throw new ApiError(400, "Invalid status");
  }

  const updated = await Offering.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  ).populate("profile", "name");

  if (!updated) throw new ApiError(404, "Offering not found");

  res.json({
    success: true,
    offering: updated,
  });
});

/**
 * ADMIN: delete an offering
 * DELETE /api/offerings/:id
 */
export const deleteOffering = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const deleted = await Offering.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, "Offering not found");

  res.json({
    success: true,
    message: "Offering deleted",
  });
});