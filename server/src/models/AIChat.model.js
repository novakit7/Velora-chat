import mongoose, { Schema } from "mongoose";

const AIChatSchema = new mongoose.Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },

    lastActivity: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AIChatSchema.index({
  user: 1,
  lastActivity: -1,
});

export const AIChat = mongoose.model("AIChat", AIChatSchema);