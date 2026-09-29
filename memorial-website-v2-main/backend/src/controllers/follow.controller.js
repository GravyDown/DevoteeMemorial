import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Follow } from "../models/follow.model.js";
import { Profile } from "../models/profile.models.js";

// POST /api/profiles/:id/follow  (auth required)
// Toggles follow on/off for the logged-in user, same toggle pattern as
// likeSharedMemory in sharedmemory.controller.js.
export const toggleFollow = asyncHandler(async (req, res) => {
  const { id: profileId } = req.params;
  const userId = req.user.id;

  const profile = await Profile.findById(profileId).select("_id");
  if (!profile) throw new ApiError(404, "Profile not found");

  const existing = await Follow.findOne({ profileId, userId });
  let following;
  if (existing) {
    await existing.deleteOne();
    following = false;
  } else {
    await Follow.create({ profileId, userId });
    following = true;
  }

  const followerCount = await Follow.countDocuments({ profileId });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { following, followerCount },
        following ? "Followed" : "Unfollowed"
      )
    );
});

// GET /api/profiles/:id/follow  (optionalAuth — works for guests too)
// Returns the follower count always, and `following` only when a user
// is logged in (mirrors getLikesForMemory's optional-userId behaviour).
export const getFollowStatus = asyncHandler(async (req, res) => {
  const { id: profileId } = req.params;
  const followerCount = await Follow.countDocuments({ profileId });

  let following;
  if (req.user?.id) {
    following = Boolean(
      await Follow.exists({ profileId, userId: req.user.id })
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        following === undefined
          ? { followerCount }
          : { followerCount, following }
      )
    );
});