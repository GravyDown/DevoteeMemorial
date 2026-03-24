import mongoose from "mongoose";

const sharedMemorySchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    type: {
      type: String,
      enum: ["Personal Story/Memory", "Prayer", "Photo/Media", "Video Link"],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    story: {
      type: String,
      required: function () {
        return this.type !== "Photo/Media" && this.type !== "Video Link";
      },
      trim: true,
    },
    media: [
      {
        type: String,
      },
    ],
    videoLink: {
      type: String,
      required: function () {
        return this.type === "Video Link";
      },
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replies: [
      {
        name: { type: String, required: true },
        text: { type: String, required: true },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export const SharedMemory = mongoose.model("SharedMemory", sharedMemorySchema);
