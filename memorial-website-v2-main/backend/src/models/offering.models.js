import mongoose from "mongoose";

const offeringSchema = new mongoose.Schema(
  {
    profile: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    relation: {
      type: String,
    },

    images: [
      {
        type: String, // Cloudinary URLs
      },
    ],

    audios: [
      {
        type: String, // Cloudinary URLs
      },
    ],

    videoLink: {
      type: String, // YouTube / Drive / Vimeo
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const Offering = mongoose.model("Offering", offeringSchema);
