import mongoose, { Schema } from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
    type: {
      type: String,
      enum: [
        "message",
        "group_created",
        "group_updated",
        "added_to_group",
        "removed_from_group",
        "left_group",
        "ai_response",
      ],
      required: true,
    },
    text: {
      type: String,
      default: "",
    },
    message: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

notificationSchema.index({ receiver: 1, isRead: 1 });

export const notification = mongoose.model("Notification", notificationSchema);
