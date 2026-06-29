import { Mongoose } from "mongoose";
import { FriendRequest } from "../models/FriendRequest.model";
import { asyncHandler } from "../utils/AsyncHandler";

const sendFriendRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(receiverId)) {
    throw new ApiError(400, "Invalid user id");
  }

  if (receiverId === req.user._id.toString()) {
    throw new ApiError(400, "You can't send request to yourself");
  }

  const existingRequest = await FriendRequest.findOne({
    sender: req.user._id,
    receiver: receiverId,
  });

  if (existingRequest) {
    throw new ApiError(400, "Friend request already exists");
  }

  const reverseRequest = await FriendRequest.findOne({
    sender: receiverId,
    receiver: req.user._id,
    status: "pending",
  });

  if (reverseRequest) {
    throw new ApiError(400, "This user has already sent you a friend request");
  }

  const request = await FriendRequest.create({
    sender: req.user._id,
    receiver: receiverId,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, request, "Friend request sent"));
});

const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await FriendRequest.findById(requestId);

  if (!request) {
    throw new ApiError(404, "Friend request not found");
  }

  if (!request.receiver.equals(req.user._id)) {
    throw new ApiError(403, "Unauthorized");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Request already handled");
  }

  request.status = "accepted";
  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Friend request accepted"));
});

const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await FriendRequest.findById(requestId);

  if (!request) {
    throw new ApiError(404, "Friend request not found");
  }

  if (!request.receiver.equals(req.user._id)) {
    throw new ApiError(403, "Unauthorized");
  }

  request.status = "rejected";
  await request.save();

  return res
    .status(200)
    .json(new ApiResponse(200, request, "Friend request rejected"));
});

const cancelFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  const request = await FriendRequest.findById(requestId);

  if (!request) {
    throw new ApiError(404, "Request not found");
  }

  if (!request.sender.equals(req.user._id)) {
    throw new ApiError(403, "Unauthorized");
  }

  if (request.status !== "pending") {
    throw new ApiError(400, "Cannot cancel");
  }

  await request.deleteOne();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Friend request cancelled"));
});

const getReceivedRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    receiver: req.user._id,
    status: "pending",
  }).populate("sender", "username fullname avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        requests,
        "received requests are featched sucessfully",
      ),
    );
});

const getSentRequests = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    sender: req.user._id,
    status: "pending",
  }).populate("receiver", "username fullname avatar");

  return res
    .status(200)
    .json(
      new ApiResponse(200, requests, "sent requests are fetched sucessfully"),
    );
});

const getFriends = asyncHandler(async (req, res) => {
  const requests = await FriendRequest.find({
    sender: req.user._id,
    status: "accepted",
  });
  return res
    .status(200)
    .json(new ApiResponse(200, requests, "friends are fetched sucessfully"));
});

const removeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.params;

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

  return res.status(200).json(new ApiResponse(200, {}, "Friend removed"));
});

export {
  sendFriendRequest,
  removeFriend,
  getFriends,
  getSentRequests,
  getReceivedRequests,
  cancelFriendRequest,
  rejectFriendRequest,
  acceptFriendRequest,
  sendFriendRequest,
};
