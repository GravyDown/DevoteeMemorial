import { Profile } from "../models/profile.models.js";
import { uploadImage } from "../utils/cloudnary.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import fs from "fs";

export const createProfile = asyncHandler(async (req, res, next) => {
  try {
    const {
      name,
      years, // optional now; will be derived if not sent
      location,
      description,
      contributorName,
      contributorPhone,
      timeline = [],
      keyAchievements = [],
      // Additional fields
      birthPlace,
      spiritualLineage,
      notableWorks,
      philosophicalContributions,
      disciples,
      memorialLocation,
      // New full dates from client (yyyy-MM-dd)
      birthDate: birthDateStr,
      deathDate: deathDateStr,
      spiritualMaster,
    } = req.body;

    // Validate required fields (years no longer required)
    if (
      !name ||
      !location ||
      !description ||
      !contributorName ||
      !contributorPhone
    ) {
      throw new ApiError(400, "All required fields must be filled");
    }

    // Expect full dates from client
    if (!birthDateStr || !deathDateStr) {
      throw new ApiError(400, "Birth date and death date are required");
    }

    // Parse "yyyy-MM-dd" as UTC to avoid timezone shifts
    const parseYMDToUTC = (ymd) => {
      const s = Array.isArray(ymd) ? ymd[0] : ymd;
      const [y, m, d] = (s || "").split("-").map(Number);
      if (!y || !m || !d) return null;
      const dt = new Date(Date.UTC(y, m - 1, d));
      return isNaN(dt.getTime()) ? null : dt;
    };

    const birthDate = parseYMDToUTC(birthDateStr);
    const deathDate = parseYMDToUTC(deathDateStr);

    if (!birthDate || !deathDate) {
      throw new ApiError(
        400,
        "Invalid birth/death date format. Expected yyyy-MM-dd"
      );
    }

    if (deathDate <= birthDate) {
      throw new ApiError(400, "Death date must be after birth date");
    }

    // Optional: basic sanity check on lifespan (<= 150 years)
    const lifeSpanYears =
      deathDate.getUTCFullYear() - birthDate.getUTCFullYear();
    if (lifeSpanYears > 150) {
      throw new ApiError(400, "Lifespan cannot exceed 150 years");
    }

    // Derive years string if not provided (back-compat)
    const yearsString =
      years && years.length
        ? Array.isArray(years)
          ? years[0]
          : years
        : `${birthDate.getUTCFullYear()} - ${deathDate.getUTCFullYear()}`;

    // Handle cover image upload
    let coverImageUrl = "";
    if (req.files && req.files.coverImage && req.files.coverImage[0]) {
      const coverImageFile = req.files.coverImage[0];
      const cloudRes = await uploadImage(coverImageFile.path);
      if (!cloudRes || !cloudRes.secure_url) {
        throw new ApiError(500, "Image upload failed");
      }
      coverImageUrl = cloudRes.secure_url;
      // Clean up the temporary file
      if (fs.existsSync(coverImageFile.path)) {
        fs.unlinkSync(coverImageFile.path);
      }
    } else {
      throw new ApiError(400, "Cover image is required");
    }

    // Handle audio files
    let audioFileUrls = [];
    if (req.files) {
      const audioFiles = Object.entries(req.files)
        .filter(([key]) => key.startsWith("audioFile_"))
        .map(([_, files]) => files[0]);

      for (const file of audioFiles) {
        try {
          const cloudRes = await uploadImage(file.path);
          if (cloudRes && cloudRes.secure_url) {
            audioFileUrls.push(cloudRes.secure_url);
          }
          // Clean up the temporary file
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        } catch (error) {
          console.error("Error uploading audio file:", error);
        }
      }
    }

    let timelineArr = [];
    if (typeof timeline === "string") {
      try {
        timelineArr = JSON.parse(timeline);
      } catch {
        timelineArr = [];
      }
    } else if (Array.isArray(timeline)) {
      timelineArr = timeline;
    }

    let achievementsArr = [];
    if (typeof keyAchievements === "string") {
      try {
        achievementsArr = JSON.parse(keyAchievements);
      } catch {
        achievementsArr = [];
      }
    } else if (Array.isArray(keyAchievements)) {
      achievementsArr = keyAchievements;
    }

    const profile = await Profile.create({
      name,
      years: yearsString, // kept for display/back-compat
      location,
      description,
      coverImage: coverImageUrl,
      contributorName,
      contributorPhone,
      timeline: timelineArr,
      keyAchievements: achievementsArr,
      status: "pending",
      // Additional fields
      birthPlace,
      spiritualLineage,
      notableWorks,
      philosophicalContributions,
      disciples,
      memorialLocation,
      audioFiles: audioFileUrls,
      // New full dates
      birthDate,
      deathDate,
      spiritualMaster,
      // birthYear/month/day and deathYear/month/day will be auto-derived by schema pre-validate
    });

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    // Clean up any uploaded files if there's an error
    if (req.files) {
      Object.values(req.files)
        .flat()
        .forEach((file) => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
    }

    // Send a proper error response
    if (error.name === "ValidationError") {
      res.status(400).json({
        success: false,
        message: error.message,
      });
    } else {
      throw error;
    }
  }
});

export const getAllPendingProfiles = asyncHandler(async (req, res, next) => {
  const profiles = await Profile.find({ status: "pending" }).sort({
    createdAt: -1,
  });
  res.json({
    success: true,
    profiles,
  });
});

export const getAllProfiles = asyncHandler(async (req, res, next) => {
  const profiles = await Profile.find({ status: "accepted" }).sort({
    createdAt: -1,
  });
  res.json({
    success: true,
    profiles,
  });
});

export const updateProfileStatus = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const profile = await Profile.findByIdAndUpdate(
    id,
    { $set: { status: status } },
    { new: true }
  );

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  res.json({
    success: true,
    message: "Profile status updated successfully",
    profile,
  });
});

export const deleteProfile = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const deletedProfile = await Profile.findByIdAndDelete(id);
  if (!deletedProfile) {
    return res.status(404).json({ message: "Profile not found" });
  }
  res.json({ success: true, message: "Profile deleted successfully" });
});

export const getProfileById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const profile = await Profile.findById(id);

  if (!profile) {
    throw new ApiError(404, "Profile not found");
  }

  res.json({
    success: true,
    profile,
  });
}); 