import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import { FriendRequest } from "../models/FriendRequest.model.js";
import { Chat } from "../models/chat.model.js";
import { User } from "../models/User.model.js";
import { Message } from "../models/Message.model.js";
import { uploadOnCloudinary, deleteFromCloudinary } from "../utils/cloudinary.js";

const createPrivateChat = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiError(400, "Invalid user id");
  }

  // Prevent self chat
  if (req.user._id.toString() === userId) {
    throw new ApiError(400, "You cannot create a chat with yourself");
  }

  // Check receiver
  const receiver = await User.exists({
    _id: userId,
  });

  if (!receiver) {
    throw new ApiError(404, "User not found");
  }

  // Friendship validation
  const friendship = await FriendRequest.exists({
    status: "accepted",
    $or: [
      {
        sender: req.user._id,
        receiver: userId,
      },
      {
        sender: userId,
        receiver: req.user._id,
      },
    ],
  });

  if (!friendship) {
    throw new ApiError(403, "You can only chat with your friends");
  }

  // Existing chat
  let chat = await Chat.findOne({
    isGroupChat: false,
    participants: {
      $all: [req.user._id, userId],
    },
  });

  // Create new chat
  if (!chat) {
    chat = await Chat.create({
      participants: [req.user._id, userId],
      createdBy: req.user._id,
      lastActivity: new Date(),
    });
  }

  // Aggregate response
  const [chatResponse] = await Chat.aggregate([
    {
      $match: {
        _id: chat._id,
      },
    },

    {
      $lookup: {
        from: "users",

        let: {
          participants: "$participants",
        },

        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $in: ["$_id", "$$participants"],
                  },

                  {
                    $ne: ["$_id", req.user._id],
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
            },
          },
        ],

        as: "otherMember",
      },
    },

    {
      $lookup: {
        from: "messages",

        localField: "latestMessage",

        foreignField: "_id",

        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "sender",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
              as: "sender",
            },
          },

          {
            $unwind: {
              path: "$sender",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              content: 1,
              attachments: 1,
              createdAt: 1,
              sender: 1,
            },
          },
        ],

        as: "latestMessage",
      },
    },

    {
      $addFields: {
        otherMember: {
          $first: "$otherMember",
        },

        latestMessage: {
          $first: "$latestMessage",
        },
      },
    },

    {
      $project: {
        _id: 1,

        isGroupChat: 1,

        otherMember: 1,

        latestMessage: 1,

        lastActivity: 1,

        createdAt: 1,

        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(chat.createdAt.getTime() === chat.updatedAt.getTime() ? 201 : 200)
    .json(
      new ApiResponse(
        chat.createdAt.getTime() === chat.updatedAt.getTime() ? 201 : 200,
        chatResponse,
        chat.createdAt.getTime() === chat.updatedAt.getTime()
          ? "Private chat created successfully"
          : "Private chat fetched successfully",
      ),
    );
});

const createGroupChat = asyncHandler(async (req, res) => {
  const { groupName, participants, description } = req.body;

  // Validate group name
  if (!groupName?.trim()) {
    throw new ApiError(400, "Group name is required");
  }

  // Validate participants
  if (!Array.isArray(participants)) {
    throw new ApiError(400, "Participants must be an array");
  }

  // Minimum members (creator + 2)
  if (participants.length < 2) {
    throw new ApiError(
      400,
      "A group must contain at least 3 members including you.",
    );
  }

  // Remove duplicate ids
  const uniqueParticipants = [
    ...new Set(participants.map((id) => id.toString())),
  ];

  // Creator should not be sent
  if (uniqueParticipants.includes(req.user._id.toString())) {
    throw new ApiError(400, "Do not include yourself in participants.");
  }

  // Validate ObjectIds
  uniqueParticipants.forEach((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, `Invalid participant id : ${id}`);
    }
  });

  // Check users exist
  const users = await User.find({
    _id: {
      $in: uniqueParticipants,
    },
  }).select("_id");

  if (users.length !== uniqueParticipants.length) {
    throw new ApiError(404, "One or more users do not exist.");
  }

  // Check friendship
  const friendships = await FriendRequest.find({
    status: "accepted",
    $or: [
      {
        sender: req.user._id,
        receiver: {
          $in: uniqueParticipants,
        },
      },
      {
        sender: {
          $in: uniqueParticipants,
        },
        receiver: req.user._id,
      },
    ],
  });

  const friendIds = new Set();

  friendships.forEach((friend) => {
    if (friend.sender.toString() === req.user._id.toString()) {
      friendIds.add(friend.receiver.toString());
    } else {
      friendIds.add(friend.sender.toString());
    }
  });

  const nonFriends = uniqueParticipants.filter((id) => !friendIds.has(id));

  if (nonFriends.length) {
    throw new ApiError(403, "You can only add your friends to the group.");
  }

  // Create group
  const group = await Chat.create({
    participants: [...uniqueParticipants, req.user._id],
    isGroupChat: true,
    groupName: groupName.trim(),
    description: description,
    createdBy: req.user._id,
    admins: [req.user._id],
    lastActivity: new Date(),
  });

  // Aggregate response
  const [groupResponse] = await Chat.aggregate([
    {
      $match: {
        _id: group._id,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
        as: "participants",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "admins",
      },
    },

    {
      $lookup: {
        from: "messages",
        localField: "latestMessage",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "sender",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
              as: "sender",
            },
          },

          {
            $unwind: {
              path: "$sender",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              content: 1,
              attachments: 1,
              createdAt: 1,
              sender: 1,
            },
          },
        ],
        as: "latestMessage",
      },
    },

    {
      $addFields: {
        latestMessage: {
          $first: "$latestMessage",
        },

        participantsCount: {
          $size: "$participants",
        },

        isAdmin: {
          $in: [req.user._id, "$admins._id"],
        },
      },
    },

    {
      $project: {
        _id: 1,

        groupName: 1,

        description: 1,

        groupAvatar: 1,

        isGroupChat: 1,

        participants: 1,

        participantsCount: 1,

        admins: 1,

        isAdmin: 1,

        latestMessage: 1,

        lastActivity: 1,

        createdAt: 1,

        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(201)
    .json(
      new ApiResponse(201, groupResponse, "Group chat created successfully."),
    );
});

const getUserChats = asyncHandler(async (req, res) => {
  const chats = await Chat.aggregate([
    {
      $match: {
        participants: req.user._id,
        hiddenFor: {
          $ne: req.user._id,
        },
      },
    },

    // Private Chat User
    {
      $lookup: {
        from: "users",
        let: {
          participants: "$participants",
          isGroupChat: "$isGroupChat",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$$isGroupChat", false],
                  },

                  {
                    $in: ["$_id", "$$participants"],
                  },

                  {
                    $ne: ["$_id", req.user._id],
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
            },
          },
        ],
        as: "otherMember",
      },
    },

    // Latest Message
    {
      $lookup: {
        from: "messages",
        localField: "latestMessage",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "sender",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
              as: "sender",
            },
          },

          {
            $unwind: {
              path: "$sender",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              content: 1,
              attachments: 1,
              sender: 1,
              createdAt: 1,
            },
          },
        ],
        as: "latestMessage",
      },
    },

    // Creator
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "createdBy",
      },
    },

    // Admins
    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "admins",
      },
    },

    {
      $addFields: {
        createdBy: {
          $first: "$createdBy",
        },

        latestMessage: {
          $first: "$latestMessage",
        },

        otherMember: {
          $first: "$otherMember",
        },

        participantsCount: {
          $size: "$participants",
        },

        isAdmin: {
          $in: [req.user._id, "$admins._id"],
        },
      },
    },

    {
      $project: {
        _id: 1,

        isGroupChat: 1,

        groupName: 1,

        groupAvatar: 1,

        otherMember: 1,

        latestMessage: 1,

        participantsCount: 1,

        createdBy: 1,

        admins: 1,

        isAdmin: 1,

        lastActivity: 1,

        createdAt: 1,

        updatedAt: 1,
      },
    },

    {
      $sort: {
        lastActivity: -1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, chats, "Chats fetched successfully."));
});

const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  let { page = 1, limit = 30 } = req.query;

  page = Number(page);
  limit = Number(limit);

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  if (page < 1 || limit < 1) {
    throw new ApiError(400, "Invalid pagination");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    participants: req.user._id,
    hiddenFor: {
        $ne: req.user._id,
    },
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found or access denied.");
  }

  const skip = (page - 1) * limit;

  const [messages, totalMessages] = await Promise.all([
    Message.aggregate([
      {
        $match: {
          chat: new mongoose.Types.ObjectId(chatId),
          isDeleted: false,
        },
      },

      {
        $sort: {
          createdAt: -1,
        },
      },

      {
        $skip: skip,
      },

      {
        $limit: limit,
      },

      {
        $lookup: {
          from: "users",
          localField: "sender",
          foreignField: "_id",
          pipeline: [
            {
              $project: {
                username: 1,
                fullName: 1,
                avatar: 1,
              },
            },
          ],
          as: "sender",
        },
      },

      {
        $unwind: "$sender",
      },

      {
        $lookup: {
          from: "messages",

          localField: "replyTo",

          foreignField: "_id",

          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "sender",
                foreignField: "_id",
                pipeline: [
                  {
                    $project: {
                      username: 1,
                      fullName: 1,
                    },
                  },
                ],
                as: "sender",
              },
            },

            {
              $unwind: {
                path: "$sender",
                preserveNullAndEmptyArrays: true,
              },
            },

            {
              $project: {
                content: 1,
                sender: 1,
              },
            },
          ],

          as: "replyTo",
        },
      },

      {
        $addFields: {
          replyTo: {
            $first: "$replyTo",
          },
        },
      },

      {
        $project: {
          chat: 1,
          content: 1,
          attachments: 1,
          sender: 1,
          replyTo: 1,
          readBy: 1,
          isEdited: 1,
          createdAt: 1,
        },
      },

      {
        $sort: {
          createdAt: 1,
        },
      },
    ]),

    Message.countDocuments({
      chat: chatId,
      isDeleted: false,
    }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        messages,
        pagination: {
          totalMessages,
          page,
          limit,
          totalPages: Math.ceil(totalMessages / limit),
          hasNextPage: page * limit < totalMessages,
          hasPrevPage: page > 1,
        },
      },
      "Messages fetched successfully.",
    ),
  );
});

const getChatById = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  const [chat] = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
        participants: req.user._id,
        hiddenFor: {
          $ne: req.user._id,
        },
      },
    },

    // Other Member (Private Chat)
    {
      $lookup: {
        from: "users",
        let: {
          participants: "$participants",
          isGroupChat: "$isGroupChat",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$$isGroupChat", false],
                  },

                  {
                    $in: ["$_id", "$$participants"],
                  },

                  {
                    $ne: ["$_id", req.user._id],
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
            },
          },
        ],
        as: "otherMember",
      },
    },

    // Participants
    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
        as: "participants",
      },
    },

    // Admins
    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "admins",
      },
    },

    // Creator
    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "createdBy",
      },
    },

    // Latest Message
    {
      $lookup: {
        from: "messages",
        localField: "latestMessage",
        foreignField: "_id",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "sender",
              foreignField: "_id",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
              as: "sender",
            },
          },

          {
            $unwind: {
              path: "$sender",
              preserveNullAndEmptyArrays: true,
            },
          },

          {
            $project: {
              content: 1,
              attachments: 1,
              sender: 1,
              createdAt: 1,
            },
          },
        ],
        as: "latestMessage",
      },
    },

    {
      $addFields: {
        createdBy: {
          $first: "$createdBy",
        },

        latestMessage: {
          $first: "$latestMessage",
        },

        otherMember: {
          $first: "$otherMember",
        },

        participantsCount: {
          $size: "$participants",
        },

        isAdmin: {
          $in: [req.user._id, "$admins._id"],
        },
      },
    },

    {
      $project: {
        _id: 1,

        isGroupChat: 1,

        groupName: 1,

        groupAvatar: 1,

        otherMember: 1,

        participants: 1,

        participantsCount: 1,

        admins: 1,

        createdBy: 1,

        isAdmin: 1,

        latestMessage: 1,

        lastActivity: 1,

        createdAt: 1,

        updatedAt: 1,
      },
    },
  ]);

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Chat fetched successfully."));
});

const renameGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { groupName } = req.body;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  if (!groupName?.trim()) {
    throw new ApiError(400, "Group name is required");
  }

  const group = await Chat.findById(chatId);

  if (!group) {
    throw new ApiError(404, "Group chat not found");
  }

  if (!group.isGroupChat) {
    throw new ApiError(400, "This is not a group chat");
  }

  const isAdmin = group.admins.some(
    (admin) => admin.toString() === req.user._id.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only group admins can rename the group");
  }

  group.groupName = groupName.trim();
  group.lastActivity = new Date();

  await group.save();

  const [updatedGroup] = await Chat.aggregate([
    {
      $match: {
        _id: group._id,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
              email: 1,
            },
          },
        ],
        as: "participants",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "admins",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "createdBy",
      },
    },

    {
      $addFields: {
        createdBy: {
          $first: "$createdBy",
        },

        participantsCount: {
          $size: "$participants",
        },

        isAdmin: {
          $in: [req.user._id, "$admins._id"],
        },
      },
    },

    {
      $project: {
        _id: 1,
        groupName: 1,
        groupAvatar: 1,
        description: 1,
        isGroupChat: 1,
        participants: 1,
        participantsCount: 1,
        admins: 1,
        createdBy: 1,
        isAdmin: 1,
        latestMessage: 1,
        lastActivity: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "Group renamed successfully."));
});

// add rename description

const updateGroupAvatar = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  const avatarLocalPath = req.file?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Group avatar is required");
  }

  const group = await Chat.findById(chatId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.isGroupChat) {
    throw new ApiError(400, "This is not a group chat");
  }

  const isAdmin = group.admins.some(
    (admin) => admin.toString() === req.user._id.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only group admins can update the group avatar");
  }

  // Upload new avatar
  const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);

  if (!uploadedAvatar) {
    throw new ApiError(500, "Failed to upload group avatar");
  }

  // Delete previous avatar
  if (group.groupAvatar?.publicId) {
    try {
      await deleteFromCloudinary(group.groupAvatar.publicId);
    } catch (err) {
      console.error("Failed to delete old avatar:", err);
    }
  }

  group.groupAvatar.publicId = uploadedAvatar.secure_url;
  group.groupAvatar.url = uploadedAvatar.url;

  group.lastActivity = new Date();

  await group.save();

  const [updatedGroup] = await Chat.aggregate([
    {
      $match: {
        _id: group._id,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "participants",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "admins",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "createdBy",
      },
    },

    {
      $addFields: {
        createdBy: {
          $first: "$createdBy",
        },

        participantsCount: {
          $size: "$participants",
        },

        isAdmin: {
          $in: [req.user._id, "$admins._id"],
        },
      },
    },

    {
      $project: {
        _id: 1,
        groupName: 1,
        groupAvatar: 1,
        isGroupChat: 1,
        participants: 1,
        participantsCount: 1,
        admins: 1,
        createdBy: 1,
        isAdmin: 1,
        lastActivity: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedGroup, "Group avatar updated successfully."),
    );
});

const addParticipants = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { participants } = req.body;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  if (!Array.isArray(participants) || participants.length === 0) {
    throw new ApiError(400, "Participants array is required");
  }

  const group = await Chat.findById(chatId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.isGroupChat) {
    throw new ApiError(400, "This is not a group chat");
  }

  const isAdmin = group.admins.some(
    (admin) => admin.toString() === req.user._id.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only admins can add participants");
  }

  const uniqueParticipants = [
    ...new Set(participants.map((id) => id.toString())),
  ];

  // Cannot add yourself
  if (uniqueParticipants.includes(req.user._id.toString())) {
    throw new ApiError(400, "You are already a participant");
  }

  // Validate ObjectIds
  uniqueParticipants.forEach((id) => {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, `Invalid participant id ${id}`);
    }
  });

  // Users exist
  const users = await User.find({
    _id: {
      $in: uniqueParticipants,
    },
  }).select("_id");

  if (users.length !== uniqueParticipants.length) {
    throw new ApiError(404, "One or more users not found");
  }

  // Check friendship
  const friendships = await FriendRequest.find({
    status: "accepted",
    $or: [
      {
        sender: req.user._id,
        receiver: {
          $in: uniqueParticipants,
        },
      },
      {
        sender: {
          $in: uniqueParticipants,
        },
        receiver: req.user._id,
      },
    ],
  });

  const friendIds = new Set();

  friendships.forEach((friend) => {
    if (friend.sender.toString() === req.user._id.toString()) {
      friendIds.add(friend.receiver.toString());
    } else {
      friendIds.add(friend.sender.toString());
    }
  });

  const nonFriends = uniqueParticipants.filter((id) => !friendIds.has(id));

  if (nonFriends.length) {
    throw new ApiError(403, "You can only add your friends");
  }

  // Already in group
  const alreadyMembers = uniqueParticipants.filter((id) =>
    group.participants.some((member) => member.toString() === id),
  );

  if (alreadyMembers.length) {
    throw new ApiError(400, "One or more users are already group members");
  }

  // Add members
  group.participants.push(
    ...uniqueParticipants.map((id) => new mongoose.Types.ObjectId(id)),
  );

  group.lastActivity = new Date();

  await group.save();

  const [updatedGroup] = await Chat.aggregate([
    {
      $match: {
        _id: group._id,
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "participants",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "admins",
      },
    },

    {
      $addFields: {
        participantsCount: {
          $size: "$participants",
        },

        isAdmin: {
          $in: [req.user._id, "$admins._id"],
        },
      },
    },

    {
      $project: {
        groupName: 1,
        groupAvatar: 1,
        participants: 1,
        admins: 1,
        participantsCount: 1,
        isAdmin: 1,
        lastActivity: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedGroup, "Participants added successfully."),
    );
});

const removeParticipant = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(chatId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new ApiError(400, "Invalid chat id or user id");
  }

  const group = await Chat.findById(chatId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.isGroupChat) {
    throw new ApiError(400, "This is not a group chat");
  }

  // Only admins can remove participants
  const isAdmin = group.admins.some(
    (admin) => admin.toString() === req.user._id.toString(),
  );

  if (!isAdmin) {
    throw new ApiError(403, "Only group admins can remove participants");
  }

  // Admin can't remove themselves
  if (req.user._id.toString() === userId) {
    throw new ApiError(400, "Use leave group instead");
  }

  // Creator cannot be removed
  if (group.createdBy.toString() === userId) {
    throw new ApiError(400, "Group creator cannot be removed");
  }

  // User must be a participant
  const isParticipant = group.participants.some(
    (participant) => participant.toString() === userId,
  );

  if (!isParticipant) {
    throw new ApiError(404, "User is not a participant of this group");
  }

  // Atomic update
  await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        participants: new mongoose.Types.ObjectId(userId),
        admins: new mongoose.Types.ObjectId(userId),
      },
      $set: {
        lastActivity: new Date(),
      },
    },
    {
      new: true,
    },
  );

  const [updatedGroup] = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "participants",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "admins",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "createdBy",
      },
    },

    {
      $addFields: {
        createdBy: {
          $first: "$createdBy",
        },

        participantsCount: {
          $size: "$participants",
        },

        isAdmin: {
          $in: [req.user._id, "$admins._id"],
        },
      },
    },

    {
      $project: {
        _id: 1,
        groupName: 1,
        groupAvatar: 1,
        isGroupChat: 1,
        participants: 1,
        participantsCount: 1,
        admins: 1,
        createdBy: 1,
        isAdmin: 1,
        latestMessage: 1,
        lastActivity: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedGroup, "Participant removed successfully."),
    );
});

const leaveGroup = asyncHandler(async (req, res) => { 
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  const group = await Chat.findById(chatId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.isGroupChat) {
    throw new ApiError(400, "This is not a group chat");
  }

  const isParticipant = group.participants.some(
    (participant) => participant.toString() === req.user._id.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this group");
  }

  // Last participant -> delete group
  if (group.participants.length === 1) {
    await Chat.findByIdAndDelete(chatId);

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Group deleted successfully."));
  }

  let update = {
    $pull: {
      participants: req.user._id,
      admins: req.user._id,
    },
    $set: {
      lastActivity: new Date(),
    },
  };

  // If creator leaves
  if (group.createdBy.toString() === req.user._id.toString()) {
    // Remaining admins
    const remainingAdmins = group.admins.filter(
      (admin) => admin.toString() !== req.user._id.toString(),
    );

    let newOwner;

    if (remainingAdmins.length) {
      newOwner = remainingAdmins[0];
    } else {
      const remainingParticipants = group.participants.filter(
        (participant) => participant.toString() !== req.user._id.toString(),
      );

      newOwner = remainingParticipants[0];

      update.$addToSet = {
        admins: newOwner,
      };
    }

    update.$set.createdBy = newOwner;
  }

  await Chat.findByIdAndUpdate(chatId, update, {
    returnDocument: "after"
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "You left the group successfully."));
});

const deleteGroup = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  const group = await Chat.findById(chatId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.isGroupChat) {
    throw new ApiError(400, "This is not a group chat");
  }

  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the group owner can delete the group");
  }

  // Delete group avatar
  if (group.groupAvatar?.publicId) {
    try {
      await deleteFromCloudinary(group.groupAvatar.publicId);
    } catch (error) {
      console.error("Failed to delete group avatar:", error.message);
    }
  }

  // Delete all messages
  await Message.deleteMany({
    chat: group._id,
  });

  // Delete chat
  await Chat.findByIdAndDelete(group._id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Group deleted successfully."));
});

const makeAdmin = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(chatId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new ApiError(400, "Invalid chat id or user id");
  }

  const group = await Chat.findById(chatId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.isGroupChat) {
    throw new ApiError(400, "This is not a group chat");
  }

  // Only owner can make admins
  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the group owner can assign admins");
  }

  // User must be participant
  const isParticipant = group.participants.some(
    (participant) => participant.toString() === userId,
  );

  if (!isParticipant) {
    throw new ApiError(404, "User is not a participant of this group");
  }

  // Already admin
  const alreadyAdmin = group.admins.some(
    (admin) => admin.toString() === userId,
  );

  if (alreadyAdmin) {
    throw new ApiError(400, "User is already an admin");
  }

  await Chat.findByIdAndUpdate(
    chatId,
    {
      $addToSet: {
        admins: new mongoose.Types.ObjectId(userId),
      },
      $set: {
        lastActivity: new Date(),
      },
    },
    {
      returnDocument: "after"
    },
  );

  const [updatedGroup] = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "participants",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "admins",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "createdBy",
      },
    },

    {
      $addFields: {
        createdBy: {
          $first: "$createdBy",
        },

        participantsCount: {
          $size: "$participants",
        },

        isAdmin: {
          $in: [req.user._id, "$admins._id"],
        },
      },
    },

    {
      $project: {
        _id: 1,
        groupName: 1,
        groupAvatar: 1,
        participants: 1,
        participantsCount: 1,
        admins: 1,
        createdBy: 1,
        isAdmin: 1,
        lastActivity: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "Admin assigned successfully."));
});

const removeAdmin = asyncHandler(async (req, res) => {
  const { chatId, userId } = req.params;

  if (
    !mongoose.Types.ObjectId.isValid(chatId) ||
    !mongoose.Types.ObjectId.isValid(userId)
  ) {
    throw new ApiError(400, "Invalid chat id or user id");
  }

  const group = await Chat.findById(chatId);

  if (!group) {
    throw new ApiError(404, "Group not found");
  }

  if (!group.isGroupChat) {
    throw new ApiError(400, "This is not a group chat");
  }

  // Only owner can remove admins
  if (group.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "Only the group owner can remove admins");
  }

  // Owner cannot remove themselves
  if (group.createdBy.toString() === userId) {
    throw new ApiError(400, "Group owner cannot remove themselves as admin");
  }

  // Must be an admin
  const isAdmin = group.admins.some((admin) => admin.toString() === userId);

  if (!isAdmin) {
    throw new ApiError(400, "User is not a group admin");
  }

  await Chat.findByIdAndUpdate(
    chatId,
    {
      $pull: {
        admins: new mongoose.Types.ObjectId(userId),
      },
      $set: {
        lastActivity: new Date(),
      },
    },
    {
      returnDocument: "after"
    },
  );

  const [updatedGroup] = await Chat.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(chatId),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "participants",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "participants",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "admins",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "admins",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "createdBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
        as: "createdBy",
      },
    },

    {
      $addFields: {
        createdBy: {
          $first: "$createdBy",
        },

        participantsCount: {
          $size: "$participants",
        },

        isAdmin: {
          $in: [req.user._id, "$admins._id"],
        },
      },
    },

    {
      $project: {
        _id: 1,
        groupName: 1,
        groupAvatar: 1,
        participants: 1,
        participantsCount: 1,
        admins: 1,
        createdBy: 1,
        isAdmin: 1,
        lastActivity: 1,
        createdAt: 1,
        updatedAt: 1,
      },
    },
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, updatedGroup, "Admin removed successfully."));
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  const chat = await Chat.findOne({
    _id: chatId,
    participants: req.user._id,
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  // Already deleted
  if (
    chat.hiddenFor.some((user) => user.toString() === req.user._id.toString())
  ) {
    throw new ApiError(400, "Chat already deleted for you");
  }

  await Chat.findByIdAndUpdate(
    chatId,
    {
      $addToSet: {
        hiddenFor: req.user._id,
      },
    },
    {
      returnDocument: "after"
    },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat deleted successfully."));
});

export {
  createPrivateChat,
  getChatMessages,
  createGroupChat,
  getUserChats,
  getChatById,
  renameGroup,
  updateGroupAvatar,
  addParticipants,
  removeParticipant,
  leaveGroup,
  deleteGroup,
  makeAdmin,
  removeAdmin,
  deleteChat,
};
