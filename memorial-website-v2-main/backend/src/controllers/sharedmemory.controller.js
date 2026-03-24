import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { SharedMemory } from "../models/sharedmemory.model.js";
import { uploadToCloudinary } from "../utils/Cloudinary.js";
import { Like } from "../models/like.model.js";
import { Comment } from "../models/comment.model.js";
import { User } from "../models/user.models.js";

export const createSharedMemory = asyncHandler(async (req, res) => {
  const { profileId, type, title, story, name, videoLink } = req.body;

  if (!profileId || !type || !title || !name) {
    throw new ApiError(400, "Profile ID, type, title, and name are required");
  }
  if ((type === "Personal Story/Memory" || type === "Prayer") && !story) {
    throw new ApiError(400, "Story/Memory is required for this contribution type");
  }
  if (type === "Video Link" && !videoLink) {
    throw new ApiError(400, "Video Link is required for this contribution type");
  }

  const mediaLocalPaths = req.files?.media?.map((file) => file.path) || [];
  const uploadedMedia = [];

  for (const localPath of mediaLocalPaths) {
    const response = await uploadToCloudinary(localPath, "iskcon/shared-memory", "auto");
    if (response?.secure_url) {
      uploadedMedia.push(response.secure_url);
    }
  }

  const sharedMemory = await SharedMemory.create({
    profileId,
    type,
    title,
    story: type === "Photo/Media" || type === "Video Link" ? undefined : story,
    media: uploadedMedia,
    videoLink: type === "Video Link" ? videoLink : undefined,
    name,
  });

  if (!sharedMemory) {
    throw new ApiError(500, "Failed to create shared memory");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, sharedMemory, "Shared memory created successfully"));
});

export const getSharedMemoriesByProfileId = asyncHandler(async (req, res) => {
  const { profileId } = req.params;
  if (!profileId) throw new ApiError(400, "Profile ID is required");

  const sharedMemories = await SharedMemory.find({ profileId })
    .select("profileId type title story media videoLink name createdAt")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, sharedMemories, "Shared memories fetched successfully"));
});

export const likeSharedMemory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;
  if (!userId) throw new ApiError(400, "User ID required");

  const existing = await Like.findOne({ memoryId: id, userId });
  let liked;
  if (existing) {
    await existing.deleteOne();
    liked = false;
  } else {
    await Like.create({ memoryId: id, userId });
    liked = true;
  }
  const likeCount = await Like.countDocuments({ memoryId: id });
  return res
    .status(200)
    .json(new ApiResponse(200, { likes: likeCount, liked }, liked ? "Liked" : "Unliked"));
});

export const getLikesForMemory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.query;
  const likeCount = await Like.countDocuments({ memoryId: id });
  let liked = undefined;
  if (userId) {
    const exists = await Like.exists({ memoryId: id, userId });
    liked = Boolean(exists);
  }
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        liked === undefined ? { likes: likeCount } : { likes: likeCount, liked }
      )
    );
});

export const replyToSharedMemory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { text } = req.body;

  if (!req.user) throw new ApiError(401, "Authentication required to comment");
  if (!text) throw new ApiError(400, "Text is required");

  const userId = req.user?.id || req.user?._id;
  let displayName = "User";
  if (userId) {
    const user = await User.findById(userId).select("username email");
    displayName = user?.username || user?.email || "User";
  } else {
    displayName = req.user?.username || req.user?.email || "User";
  }

  await Comment.create({ memoryId: id, name: displayName, text, userId });
  const comments = await Comment.find({ memoryId: id }).sort({ createdAt: 1 });
  return res.status(200).json(new ApiResponse(200, comments, "Reply added"));
});

export const getCommentsForMemory = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const comments = await Comment.find({ memoryId: id }).sort({ createdAt: 1 });
  return res.status(200).json(new ApiResponse(200, comments));
});
