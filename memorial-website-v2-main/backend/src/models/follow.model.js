import mongoose from "mongoose";

// One row per (user, profile) follow relationship — same pattern as
// Like's (memoryId, userId) compound unique index.
const followSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

followSchema.index({ profileId: 1, userId: 1 }, { unique: true });

export const Follow = mongoose.model("Follow", followSchema);