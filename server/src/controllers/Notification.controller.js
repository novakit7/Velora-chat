import mongoose from "mongoose";
import { Notification } from "../models/Notification.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";

const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    receiver: req.user._id,
  })
    .populate("sender", "username fullname avatar")
    .populate("chat")
    .populate("message")
    .sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      notifications,
      "Notifications fetched successfully"
    )
  );
});

const markNotificationAsRead = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  const notification = await Notification.findOne({
    _id: notificationId,
    receiver: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  notification.isRead = true;

  await notification.save();

  return res.status(200).json(
    new ApiResponse(
      200,
      notification,
      "Notification marked as read successfully"
    )
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
    }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      null,
      "All notifications marked as read successfully"
    )
  );
});

const deleteNotification = asyncHandler(async (req, res) => {
  const { notificationId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new ApiError(400, "Invalid notification id");
  }

  const notification = await Notification.findOneAndDelete({
    _id: notificationId,
    receiver: req.user._id,
  });

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { notificationId },
      "Notification deleted successfully"
    )
  );
});

const deleteAllNotifications = asyncHandler(async (req, res) => {
  const result = await Notification.deleteMany({
    receiver: req.user._id,
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        deletedCount: result.deletedCount,
      },
      "All notifications deleted successfully"
    )
  );
});

export {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
};