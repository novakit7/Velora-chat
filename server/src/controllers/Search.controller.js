import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

const searchUsers = asyncHandler(async (req, res) => {
  const { query = "" } = req.query;

  const currentUserId = new mongoose.Types.ObjectId(req.user._id);

  const matchStage = {
    _id: { $ne: currentUserId },
  };

  // Search by username or full name
  if (query.trim()) {
    matchStage.$or = [
      {
        username: {
          $regex: query.trim(),
          $options: "i",
        },
      },
      {
        fullName: {
          $regex: query.trim(),
          $options: "i",
        },
      },
    ];
  }

  const users = await User.aggregate([
    {
      $match: matchStage,
    },

    // Find any existing interaction between both users
    {
      $lookup: {
        from: "friendrequests",

        let: {
          otherUserId: "$_id",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $or: [
                  // Current user -> Other user
                  {
                    $and: [
                      {
                        $eq: ["$sender", currentUserId],
                      },
                      {
                        $eq: ["$receiver", "$$otherUserId"],
                      },
                    ],
                  },

                  // Other user -> Current user
                  {
                    $and: [
                      {
                        $eq: ["$sender", "$$otherUserId"],
                      },
                      {
                        $eq: ["$receiver", currentUserId],
                      },
                    ],
                  },
                ],
              },
            },
          },

          // We only need to know if one exists
          {
            $limit: 1,
          },
        ],

        as: "friendInteraction",
      },
    },

    // Keep ONLY users with no interaction
    {
      $match: {
        friendInteraction: {
          $size: 0,
        },
      },
    },

    // Return only what AddFriend.jsx needs
    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        email: 1,
      },
    },

    // Optional limit
    {
      $limit: 30,
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      users,
      "Users fetched successfully",
    ),
  );
});

export { searchUsers };