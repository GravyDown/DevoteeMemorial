import { Profile } from "../models/profile.models.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";

/**
 * Create a new profile
 */
export const createProfile = asyncHandler(async (req, res) => {
  try {
    const {
      name,
      birthDate,
      deathDate,
      spiritualMaster,
      honorific,
      associatedTemple,
      ashramRole,
      coreServices,
      accountType,
      location,
      description,
      contributorName,
      contributorPhone,
      birthPlace,
      spiritualLineage,
      notableWorks,
      philosophicalContributions,
      disciples,
      memorialLocation,
    } = req.body;

    // Validate required fields
    if (!name || !birthDate || !deathDate || !spiritualMaster || !location || !description || !contributorName || !contributorPhone) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Check if cover image was uploaded
    if (!req.files?.coverImage?.[0]) {
      return res.status(400).json({
        success: false,
        message: "Cover image is required",
      });
    }

    console.log("Uploading cover image to Cloudinary...");
    
    // Upload cover image to Cloudinary
    const coverImagePath = req.files.coverImage[0].path;
    const coverImageUpload = await uploadToCloudinary(
      coverImagePath,
      "iskcon/profiles",
      "image"
    );

    if (!coverImageUpload) {
      return res.status(500).json({
        success: false,
        message: "Failed to upload cover image to Cloudinary",
      });
    }

    console.log("Cover image uploaded successfully:", coverImageUpload.secure_url);

    // Handle audio files (if any)
    const audioFiles = [];
    for (let i = 0; i < 10; i++) {
      const fieldName = `audioFile_${i}`;
      if (req.files?.[fieldName]?.[0]) {
        console.log(`Uploading audio file ${i}...`);
        const audioPath = req.files[fieldName][0].path;
        const audioUpload = await uploadToCloudinary(
          audioPath,
          "iskcon/audio",
          "auto"
        );
        
        if (audioUpload) {
          audioFiles.push(audioUpload.secure_url);
          console.log(`Audio file ${i} uploaded:`, audioUpload.secure_url);
        }
      }
    }

    // Parse coreServices if it's a string
    let parsedCoreServices = coreServices;
    if (typeof coreServices === "string") {
      try {
        parsedCoreServices = JSON.parse(coreServices);
      } catch (e) {
        parsedCoreServices = coreServices.split(",").map(s => s.trim());
      }
    }

    // Create profile
    const profile = await Profile.create({
      name,
      birthDate: new Date(birthDate),
      deathDate: new Date(deathDate),
      spiritualMaster,
      honorific,
      associatedTemple,
      ashramRole,
      coreServices: parsedCoreServices,
      accountType,
      location,
      description,
      coverImage: coverImageUpload.secure_url, // NOT coverImageUpload.url 
      contributorName,
      contributorPhone,
      birthPlace,
      spiritualLineage,
      notableWorks,
      philosophicalContributions,
      disciples,
      memorialLocation,
      audioFiles,
      status: "pending", // Default status
    });

    console.log("Profile created successfully:", profile._id);

    res.status(201).json({
      success: true,
      message: "Profile created successfully",
      profile,
    });
  } catch (error) {
    console.error("Error creating profile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create profile",
    });
  }
});

/**
 * Get all accepted profiles
 */
export const getAllProfiles = asyncHandler(async (req, res) => {
  try {
    const profiles = await Profile.find({ status: "accepted" }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profiles",
    });
  }
});

/**
 * Get all pending profiles (for admin)
 */
export const getAllPendingProfiles = asyncHandler(async (req, res) => {
  try {
    const profiles = await Profile.find({ status: "pending" }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: profiles.length,
      profiles,
    });
  } catch (error) {
    console.error("Error fetching pending profiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending profiles",
    });
  }
});

/**
 * Get profile by ID
 */
export const getProfileById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findById(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch profile",
    });
  }
});

/**
 * Update profile status (admin)
 */
export const updateProfileStatus = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "accepted", "declined"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid status",
      });
    }

    const profile = await Profile.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.status(200).json({
      success: true,
      message: `Profile ${status}`,
      profile,
    });
  } catch (error) {
    console.error("Error updating profile status:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update profile status",
    });
  }
});

/**
 * Delete profile
 */
export const deleteProfile = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByIdAndDelete(id);

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    // TODO: Delete associated images from Cloudinary
    // const publicId = profile.coverImage.split('/').pop().split('.')[0];
    // await deleteFromCloudinary(publicId);

    res.status(200).json({
      success: true,
      message: "Profile deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete profile",
    });
  }
});