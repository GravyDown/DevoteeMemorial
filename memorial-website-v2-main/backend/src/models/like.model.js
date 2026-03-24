import mongoose from "mongoose";

const likeSchema = new mongoose.Schema({
  memoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SharedMemory",
    required: true,
  },
  userId: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

likeSchema.index({ memoryId: 1, userId: 1 }, { unique: true });

export const Like = mongoose.model("Like", likeSchema);
