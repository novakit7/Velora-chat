// services/notification.service.js

import { Notification } from "../models/Notification.model.js";
import { getReceiverSocketId, io } from "../socket/index.js";

export const sendNotification = async ({
  sender,
  receiver,
  chat = null,
  message = null,
  type,
  text = "",
}) => {
  // Save notification
  const notification = await Notification.create({
    sender,
    receiver,
    chat,
    message,
    type,
    text,
  });

  // Populate if needed
  const populatedNotification = await Notification.findById(notification._id)
    .populate("sender", "username fullname avatar")
    .populate("chat")
    .populate("message");

  // Emit if receiver is online
  const receiverSocketId = getReceiverSocketId(receiver.toString());

  if (receiverSocketId) {
    io.to(receiverSocketId).emit(
      "new_notification",
      populatedNotification
    );
  }

  return populatedNotification;
};