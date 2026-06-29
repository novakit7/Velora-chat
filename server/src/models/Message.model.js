import mongoose, { Schema } from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      default: "",
    },
    attachments: {
      type: [String],
      default: [],
    },
    readBy: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    replyTo: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    isEdited: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

export const Message = mongoose.model("Message", messageSchema);
