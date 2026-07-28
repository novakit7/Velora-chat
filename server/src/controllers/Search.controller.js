import { User } from "../models/User.model.js";
import { FriendRequest } from "../models/FriendRequest.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

import mongoose from "mongoose";

const searchUsers = asyncHandler(async (req, res) => {
  const { query = "" } = req.query;

  const currentUserId = new mongoose.Types.ObjectId(req.user._id);

  const matchStage = {
    _id: { $ne: currentUserId },
  };

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

    // Find any friend request between current user and this user
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
                      { $eq: ["$sender", currentUserId] },
                      { $eq: ["$receiver", "$$otherUserId"] },
                    ],
                  },

                  // Other user -> Current user
                  {
                    $and: [
                      { $eq: ["$sender", "$$otherUserId"] },
                      { $eq: ["$receiver", currentUserId] },
                    ],
                  },
                ],
              },
            },
          },

          {
            $sort: {
              createdAt: -1,
            },
          },

          {
            $limit: 1,
          },
        ],

        as: "friendRequest",
      },
    },

    // Convert lookup array into single object
    {
      $addFields: {
        friendRequest: {
          $arrayElemAt: ["$friendRequest", 0],
        },
      },
    },

    // Create frontend-friendly friendship object
    {
      $addFields: {
        friendship: {
          $cond: [
            // No request exists
            {
              $eq: [
                { $type: "$friendRequest" },
                "missing",
              ],
            },

            {
              status: "none",
              direction: null,
              requestId: null,
            },

            // Request exists
            {
              status: "$friendRequest.status",

              direction: {
                $cond: [
                  {
                    $eq: [
                      "$friendRequest.sender",
                      currentUserId,
                    ],
                  },
                  "sent",
                  "received",
                ],
              },

              requestId: "$friendRequest._id",
            },
          ],
        },
      },
    },

    {
      $project: {
        username: 1,
        fullName: 1,
        avatar: 1,
        email: 1,
        friendship: 1,
      },
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