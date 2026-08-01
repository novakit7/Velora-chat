import { Notification } from "../models/Notification.model.js";

export const createNotification = async ({
  sender,
  receiver,
  type,
  text = "",
  friendRequest = null,
  chat = null,
  message = null,
}) => {
  const notification = await Notification.create({
    sender,
    receiver,
    type,
    text,
    friendRequest,
    chat,
    message,
  });

  return await Notification.findById(notification._id)
    .populate("sender", "_id username fullName email avatar")
    .populate("receiver", "_id username fullName email avatar")
    .populate("friendRequest")
    .populate("chat")
    .populate("message");
};