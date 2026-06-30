import mongoose, { Schema } from "mongoose";

const AIConversationSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    chat: {
      type: Schema.Types.ObjectId,
      ref: "AIChat",
      required: true,
      index: true,
    },

    prompt: {
      type: String,
      required: true,
      trim: true,
    },

    response: {
      type: String,
      required: true,
      trim: true,
    },

    model: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// Fast history loading
AIConversationSchema.index({
  chat: 1,
  createdAt: 1,
});

export const AIConversation = mongoose.model(
  "AIConversation",
  AIConversationSchema,
);