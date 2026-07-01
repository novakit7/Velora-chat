// services/notification.service.js

import { Notification } from "../models/Notification.model.js";

const sendNotification = async ({
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

  return populatedNotification;
};

export {sendNotification}