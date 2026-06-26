import mongoose, { Schema } from "mongoose";

const AIConversationSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chat: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
    },
    prompt: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      default: "",
    },
    task: {
      type: String,
      enum: ["chat", "translation", "summarization"],
      default: "chat",
    },
    model: {
      type: String,
      default: "gpt-5",
    },
  },
  { timestamps: true },
);

export const AIConversation = mongoose.model(
  "AIConversation",
  AIConversationSchema,
);
