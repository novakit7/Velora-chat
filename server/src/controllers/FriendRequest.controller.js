import mongoose from "mongoose";
import { FriendRequest } from "../models/FriendRequest.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { sendToUser } from "../services/socket.services.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

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

  sendToUser(receiverId, "friend_request", {
    requestId: request._id,
    senderId: req.user._id,
    message: "New friend request",
  });

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Friend request sent"));
});

//GET INCOMING REQUESTS
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

  sendToUser(request.sender.toString(), "friend_request_accepted", {
    requestId: request._id,
    userId: req.user._id,
    message: "Your friend request was accepted",
  });

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

  await request.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      { requestId },
      "Friend request rejected",
    ),
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

  await request.deleteOne();

  return res.status(200).json(
    new ApiResponse(
      200,
      { requestId },
      "Friend request cancelled",
    ),
  );
});

export {
  sendFriendRequest,
  getReceivedRequests,
  getSentRequests,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
};