import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { Notification } from "../models/Notification.model.js";

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    receiver: req.user._id,
  })
    .populate("sender", "username fullname avatar")
    .populate("chat")
    .populate("message")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(200, notifications, "Notifications fetched successfully"),
    );
});

const getNotificationById = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  const notification = await Notification.findById(notificationId)
    .populate("sender", "username fullname avatar")
    .populate("receiver", "username fullname avatar")
    .populate("chat")
    .populate("message");

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to view this notification");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, notification, "Notification fetched successfully"),
    );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to mark this notification as read",
    );
  }

  if (notification.isRead) {
    throw new ApiError(400, "Notification is already marked as read");
  }

  notification.isRead = true;

  await notification.save();

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        notification,
        "Notification marked as read successfully",
      ),
    );
});

const markAllNotificationsAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    {
      receiver: req.user._id,
      isRead: false,
    },
    {
      $set: {
        isRead: true,
      },
    },
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, {}, "All notifications marked as read successfully"),
    );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  const notification = await Notification.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (notification.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "You are not authorized to delete this notification",
    );
  }

  await Notification.findByIdAndDelete(notificationId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Notification deleted successfully"));
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({
    receiver: req.user._id,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "All notifications deleted successfully"));
});

export {
  getNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
};
