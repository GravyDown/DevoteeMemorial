import mongoose from "mongoose";
import { Profile } from "./models/profile.models.js";
import { uploadToCloudinary } from "./utils/cloudinary.js";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: "./.env"
});

// Helper function to download image from URL
async function downloadImage(url, filepath) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to download image: ${response.statusText}`);
  const buffer = await response.buffer();
  fs.writeFileSync(filepath, buffer);
  return filepath;
}

// Helper function to upload image to Cloudinary
async function uploadImageToCloudinary(imageUrl, name) {
  try {
    const tempDir = path.join(__dirname, "public", "temp");
    
    // Ensure temp directory exists
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempFilePath = path.join(tempDir, `${name.replace(/\s+/g, "_")}.jpg`);
    
    console.log(`Downloading image for ${name}...`);
    await downloadImage(imageUrl, tempFilePath);
    
    console.log(`Uploading ${name} to Cloudinary...`);
    const result = await uploadToCloudinary(tempFilePath, "iskcon/profiles", "image");
    
    if (result) {
      console.log(`✅ Uploaded ${name}: ${result.secure_url}`);
      return result.secure_url;
    } else {
      console.error(`❌ Failed to upload ${name}`);
      return null;
    }
  } catch (error) {
    console.error(`Error uploading image for ${name}:`, error.message);
    return null;
  }
}

const seedProfiles = [
  {
    name: "Srila Prabhupada",
    birthDate: new Date("1896-09-01"),
    deathDate: new Date("1977-11-14"),
    spiritualMaster: "Bhaktisiddhanta Sarasvati Thakura",
    location: "Vrindavan, India",
    description: "Founder-Acharya of the International Society for Krishna Consciousness (ISKCON). His Divine Grace A.C. Bhaktivedanta Swami Prabhupada appeared in this world in 1896 in Calcutta, India. He first met his spiritual master, Srila Bhaktisiddhanta Sarasvati Gosvami, in Calcutta in 1922.",
    imageUrl: "https://hkmguwahati.org/wp-content/uploads/2021/04/s03-srila-prabhupada-books.jpg",
    contributorName: "Admin",
    contributorPhone: "1234567890",
    status: "accepted",
    honorific: "His Divine Grace",
    associatedTemple: "ISKCON Vrindavan",
    memorialLocation: "Vrindavan, India"
  },
  {
    name: "Bhaktisiddhanta Sarasvati",
    birthDate: new Date("1874-02-06"),
    deathDate: new Date("1937-01-01"),
    spiritualMaster: "Gaurakisora Dasa Babaji",
    location: "Mayapur, India",
    description: "Spiritual master of Srila Prabhupada and a great Vaishnava acharya. He established the Gaudiya Math and preached Krishna consciousness throughout India.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQSUj-1cGe4z2ZaLY8yphXGi-qPm0xye2CdE4hZ3S7Stl8myMtY3qjbqMegueDh650ZhjLqo8gHwBEqVvt7o1z0lvmQqjZfnZSMjsQN-Q&s=10",
    contributorName: "Admin",
    contributorPhone: "1234567890",
    status: "accepted",
    honorific: "Srila",
    associatedTemple: "Gaudiya Math",
    memorialLocation: "Mayapur, India"
  },
  {
    name: "HH Radhanath Swami",
    birthDate: new Date("1950-12-07"),
    deathDate: new Date("2023-08-01"),
    spiritualMaster: "Srila Prabhupada",
    location: "Mumbai, India",
    description: "His Holiness Radhanath Swami is a beloved spiritual leader and teacher of bhakti yoga. He is the author of 'The Journey Home' and has inspired millions worldwide.",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOlFqqEzywXFBCcE3e-rOky1fBpOuVb8n3uA&s",
    contributorName: "Admin",
    contributorPhone: "9999999999",
    status: "accepted",
    honorific: "His Holiness",
    associatedTemple: "ISKCON Mumbai",
    memorialLocation: "Mumbai, India"
  }
];

async function seed() {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected for seeding\n");

    // Clear existing profiles (optional - comment out if you want to keep existing data)
    await Profile.deleteMany({});
    console.log("🗑️  Cleared existing profiles\n");

    console.log("📤 Starting upload to Cloudinary...\n");

    // Process each profile and upload images to Cloudinary
    const processedProfiles = [];
    
    for (const profileData of seedProfiles) {
      const { imageUrl, ...profileFields } = profileData;
      
      // Upload image to Cloudinary
      const cloudinaryUrl = await uploadImageToCloudinary(imageUrl, profileData.name);
      
      if (cloudinaryUrl) {
        processedProfiles.push({
          ...profileFields,
          coverImage: cloudinaryUrl
        });
      } else {
        console.warn(`⚠️  Skipping ${profileData.name} - image upload failed`);
      }
      
      console.log(""); // Empty line for readability
    }

    if (processedProfiles.length === 0) {
      console.error("❌ No profiles to insert - all image uploads failed");
      process.exit(1);
    }

    // Insert profiles into database
    console.log("💾 Inserting profiles into database...\n");
    const result = await Profile.insertMany(processedProfiles);
    
    console.log(`\n✅ Successfully seeded ${result.length} profiles:\n`);
    result.forEach(profile => {
      console.log(`   - ${profile.name}`);
      console.log(`     ID: ${profile._id}`);
      console.log(`     Image: ${profile.coverImage}`);
      console.log("");
    });

    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    process.exit(1);
  }
}

seed();