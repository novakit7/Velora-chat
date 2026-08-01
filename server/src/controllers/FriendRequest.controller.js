import mongoose from "mongoose";
import { FriendRequest } from "../models/FriendRequest.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { emitToUser } from "../sockets/socket.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Chat } from "../models/Chat.model.js";
import { Message } from "../models/Message.model.js";
import { SOCKET_EVENTS } from "../constants.js";
import { createNotification } from "../services/notification.services.js";

const sendFriendRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (receiverId === req.user._id.toString()) {
    throw new ApiError(400, "You cannot send a friend request to yourself");
  }

  // Check relationship in both directions
  const existingRequest = await FriendRequest.findOne({
    $or: [
      {
        sender: req.user._id,
        receiver: receiverId,
      },
      {
        sender: receiverId,
        receiver: req.user._id,
      },
    ],
  });

  if (existingRequest) {
    if (existingRequest.status === "accepted") {
      throw new ApiError(400, "You are already friends");
    }

    if (
      existingRequest.status === "pending" &&
      existingRequest.sender.equals(req.user._id)
    ) {
      throw new ApiError(400, "Friend request already sent");
    }

    if (
      existingRequest.status === "pending" &&
      existingRequest.receiver.equals(req.user._id)
    ) {
      throw new ApiError(
        400,
        "This user has already sent you a friend request",
      );
    }

    // Handles old rejected records if they exist
    if (existingRequest.status === "rejected") {
      await existingRequest.deleteOne();
    }
  }

  const request = await FriendRequest.create({
    sender: req.user._id,
    receiver: receiverId,
    status: "pending",
  });

  const notification = await createNotification({
    sender: req.user._id,
    receiver: receiverId,
    type: "friend_request",
    text: `${req.user.username} sent you a friend request.`,
    friendRequest: request._id,
  });
  const populatedRequest = await FriendRequest.findById(request._id)
    .populate("sender", "_id username fullName avatar email")
    .populate("receiver", "_id username fullName avatar email");

  emitToUser(
    receiverId,
    SOCKET_EVENTS.NOTIFICATION_NEW,
    notification
  );

  emitToUser(
    receiverId,
    SOCKET_EVENTS.FRIEND_RECEIVED,
    populatedRequest
  );

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Friend request sent"));
});

const getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    receiver: req.user._id,
    status: "pending",
  })
    .populate("sender", "username fullName avatar email")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      requests,
      "Incoming friend requests fetched successfully",
    ),
  );
});

const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    sender: req.user._id,
    status: "pending",
  })
    .populate("receiver", "username fullName avatar email")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      requests,
      "Sent friend requests fetched successfully",
    ),
  );
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid request id");
  }

  const request = await FriendRequest.findOne({
    _id: requestId,
    receiver: req.user._id,
    status: "pending",
  });

  if (!request) {
    throw new ApiError(404, "Pending friend request not found");
  }

  request.status = "accepted";
  await request.save();

  const notification = await createNotification({
    sender: req.user._id,
    receiver: request.sender,
    type: "friend_request_accepted",
    text: `${req.user.username} accepted your friend request.`,
    friendRequest: request._id,
  });

  emitToUser(
    request.sender,
    SOCKET_EVENTS.NOTIFICATION_NEW,
    notification
  );
  emitToUser(
    request.sender,
    SOCKET_EVENTS.FRIEND_ACCEPTED,
    {
      requestId: request._id,
      friend: req.user,
    }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Friend request accepted"));
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid request id");
  }

  const request = await FriendRequest.findOne({
    _id: requestId,
    receiver: req.user._id,
    status: "pending",
  });

  if (!request) {
    throw new ApiError(404, "Pending friend request not found");
  }

  const senderId = request.sender.toString();

  await request.deleteOne();
  console.log("Reject Request Id:", requestId);
  emitToUser(senderId, SOCKET_EVENTS.FRIEND_REJECTED, {
    requestId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { requestId },
      "Friend request rejected successfully"
    )
  );
});

const cancelFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(requestId)) {
    throw new ApiError(400, "Invalid request id");
  }

  const request = await FriendRequest.findOne({
    _id: requestId,
    sender: req.user._id,
    status: "pending",
  });

  if (!request) {
    throw new ApiError(404, "Pending friend request not found");
  }

  const receiverId = request.receiver.toString();

  await request.deleteOne();

  emitToUser(receiverId, SOCKET_EVENTS.FRIEND_CANCELLED, {
    requestId,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      { requestId },
      "Friend request cancelled successfully"
    )
  );
});

const getFriends = asyncHandler(async (req, res) => {

  const requests = await FriendRequest.find({
    $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    status: "accepted",
  })
    .populate("sender", "fullName avatar username email")
    .populate("receiver", "fullName avatar username email");

  const friendsList = requests.map((requests) => {
    if (requests.sender._id.toString() === req.user._id.toString()) {
      return requests.receiver;
    }

    return requests.sender;
  });
  return res
    .status(200)
    .json(new ApiResponse(200, friendsList, "friends are fetched sucessfully"));
});

const removeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(friendId)) {
    throw new ApiError(400, "Invalid friend id");
  }

  // Remove friendship
  const friendship = await FriendRequest.findOneAndDelete({
    status: "accepted",
    $or: [
      {
        sender: req.user._id,
        receiver: friendId,
      },
      {
        sender: friendId,
        receiver: req.user._id,
      },
    ],
  });

  if (!friendship) {
    throw new ApiError(404, "Friend not found");
  }

  // Find one-to-one chat
  const chat = await Chat.findOne({
    isGroupChat: false,
    participants: {
      $all: [req.user._id, friendId],
    },
  });

  if (chat) {
    // Delete all messages
    await Message.deleteMany({
      chat: chat._id,
    });

    // Delete chat
    await chat.deleteOne();
  }

  const notification = await createNotification({
    sender: req.user._id,
    receiver: friendId,
    type: "friend_removed",
    text: `${req.user.username} removed you from their friends.`,
  });

  emitToUser(
    friendId,
    SOCKET_EVENTS.NOTIFICATION_NEW,
    notification
  );

  emitToUser(
    friendId,
    SOCKET_EVENTS.FRIEND_REMOVED,
    {
      friendId: req.user._id,
    }
  );
  return res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Friend removed successfully"
    )
  );
});


export {
  sendFriendRequest,
  getReceivedRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getFriends,
  removeFriend
};