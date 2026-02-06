import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Upload file to Cloudinary
 * @param {string} localFilePath - Path to the local file
 * @param {string} folder - Cloudinary folder (default: "iskcon")
 * @param {"image" | "video" | "audio" | "auto"} resourceType - Type of resource
 * @returns {Promise<object|null>} Cloudinary response or null
 */
export const uploadToCloudinary = async (
  localFilePath,
  folder = "iskcon",
  resourceType = "auto"
) => {
  try {
    if (!localFilePath) {
      console.log("No file path provided");
      return null;
    }

    // Check if file exists
    if (!fs.existsSync(localFilePath)) {
      console.error("File does not exist:", localFilePath);
      return null;
    }

    console.log(`Uploading to Cloudinary: ${localFilePath}`);

    // Upload to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      folder,
      resource_type: resourceType,
      // Add transformation for images to optimize
      ...(resourceType === "image" && {
        transformation: [
          { quality: "auto", fetch_format: "auto" }
        ]
      })
    });

    console.log("Cloudinary upload successful:", response.secure_url);

    // Cleanup local file after successful upload
    fs.unlinkSync(localFilePath);

    return response;
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    
    // Cleanup local file even on error
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }
    
    return null;
  }
};

/**
 * Delete file from Cloudinary
 * @param {string} publicId - Cloudinary public ID
 * @param {"image" | "video" | "audio"} resourceType - Type of resource
 * @returns {Promise<object>}
 */
export const deleteFromCloudinary = async (publicId, resourceType = "image") => {
  try {
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType,
    });
    console.log("Cloudinary delete successful:", publicId);
    return response;
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    throw error;
  }
};

export default cloudinary;