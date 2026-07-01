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

  return notification;
};

export {sendNotification}