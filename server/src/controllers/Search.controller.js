import { User } from "../models/User.model.js";
import { FriendRequest } from "../models/FriendRequest.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const searchUsers = asyncHandler(async (req, res) => {
  const { query } = req.query;

  const matchStage = {
    _id: {
      $ne: req.user._id,
    },
  };

  // Apply search only if query is provided
  if (query?.trim()) {
    matchStage.$or = [
      {
        username: {
          $regex: query,
          $options: "i",
        },
      },
      {
        fullName: {
          $regex: query,
          $options: "i",
        },
      },
    ];
  }

  const users = await User.aggregate([
    {
      $match: matchStage,
    },
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        email: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, users, "Users fetched successfully"));
});

export { searchUsers };