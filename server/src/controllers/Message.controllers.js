import mongoose from "mongoose";
import { Chat } from "../models/chat.model.js";
import { Message } from "../models/Message.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/Cloudinary.js";
import { sendNotification } from "../services/notification.services.js";

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { content } = req.body;
  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }
  if (!content?.trim()) {
    throw new ApiError(400, "Message cannot be empty");
  }
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }
  const isParticipant = chat.participants.some(
    (participant) => participant.toString() === req.user._id.toString(),
  );
  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this chat");
  }
  const message = await Message.create({
    chat: chat._id,
    sender: req.user._id,
    content: content.trim(),
    readBy: [req.user._id],
  });
  chat.latestMessage = message._id;
  chat.lastActivity = new Date();
  await chat.save();
  const populatedMessage = await Message.findById(message._id).populate(
    "sender",
    "username fullname avatar",
  );

  const receiver = chat.participants.find(
    (participant) => participant.toString() !== req.user._id.toString(),
  );

  const notification = await sendNotification({
    sender: req.user._id,
    receiver,
    chat: chat._id,
    message: message._id,
    type: "message",
    text: `${req.user.username} sent you a message`,
  });
  return res
    .status(201)
    .json(new ApiResponse(201, populatedMessage, "Message sent successfully"));
});

const editMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message id");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Message content cannot be empty");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to edit this message");
  }

  if (message.isDeleted) {
    throw new ApiError(400, "Cannot edit a deleted message");
  }

  message.content = content.trim();
  message.isEdited = true;

  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message edited successfully"));
});

const deleteMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message id");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized to delete this message");
  }

  if (message.isDeleted) {
    throw new ApiError(400, "Message is already deleted");
  }

  message.isDeleted = true;
  message.content = "";

  await message.save();

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message deleted successfully"));
});

const markMessageAsRead = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message id");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (!message.readBy.includes(req.user._id)) {
    message.readBy.push(req.user._id);
    await message.save();
  }

  return res
    .status(200)
    .json(new ApiResponse(200, message, "Message marked as read"));
});

const replyToMessage = asyncHandler(async (req, res) => {
  const { messageId } = req.params;
  const { content } = req.body;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message id");
  }

  if (!content?.trim()) {
    throw new ApiError(400, "Message content cannot be empty");
  }

  const parentMessage = await Message.findById(messageId);

  if (!parentMessage) {
    throw new ApiError(404, "Message not found");
  }

  const reply = await Message.create({
    chat: parentMessage.chat,
    sender: req.user._id,
    content: content.trim(),
    replyTo: parentMessage._id,
    readBy: [req.user._id],
  });

  await Chat.findByIdAndUpdate(parentMessage.chat, {
    latestMessage: reply._id,
    lastActivity: new Date(),
  });

  const populatedReply = await Message.findById(reply._id)
    .populate("sender", "username fullname avatar")
    .populate("replyTo");

  return res
    .status(201)
    .json(new ApiResponse(201, populatedReply, "Reply sent successfully"));
});

const sendAttachment = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id");
  }

  const chat = await Chat.findById(chatId);

  if (!chat) {
    throw new ApiError(404, "Chat not found");
  }

  const isParticipant = chat.participants.some(
    (participant) => participant.toString() === req.user._id.toString(),
  );

  if (!isParticipant) {
    throw new ApiError(403, "You are not a participant of this chat");
  }

  const attachmentLocalPath = req.file?.path;

  if (!attachmentLocalPath) {
    throw new ApiError(400, "Attachment is required");
  }

  const attachment = await uploadOnCloudinary(attachmentLocalPath);

  if (!attachment?.url) {
    throw new ApiError(500, "Failed to upload attachment");
  }

  const message = await Message.create({
    chat: chat._id,
    sender: req.user._id,
    attachments: [attachment.url],
    readBy: [req.user._id],
  });

  chat.latestMessage = message._id;
  chat.lastActivity = new Date();

  await chat.save();

  return res
    .status(201)
    .json(new ApiResponse(201, message, "Attachment sent successfully"));
});

const deleteMessageForEveryone = asyncHandler(async (req, res) => {
  const { messageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(messageId)) {
    throw new ApiError(400, "Invalid message id");
  }

  const message = await Message.findById(messageId);

  if (!message) {
    throw new ApiError(404, "Message not found");
  }

  if (message.sender.toString() !== req.user._id.toString()) {
    throw new ApiError(
      403,
      "Only the sender can delete this message for everyone",
    );
  }

  await Message.findByIdAndDelete(messageId);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Message deleted successfully"));
});

export {
  sendMessage,
  editMessage,
  deleteMessage,
  markMessageAsRead,
  replyToMessage,
  sendAttachment,
  deleteMessageForEveryone,
};
