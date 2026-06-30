import mongoose, { Schema } from "mongoose";

const chatSchema = new mongoose.Schema(
  {
    participants: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      validate: {
        validator: function (value) {
          return value.length >= 2;
        },
        message: "A chat must have at least two participants.",
      },
    },
    isGroupChat: {
      type: Boolean,
      default: false,
    },
    groupName: {
      type: String,
      default: "",
    },
    groupAvatar: {
      url: {
        type: String,
        default: "",
      },
      publicId: {
        type: String,
        default: "",
      },
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    latestMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    lastActivity: {
      type: Date,
      default: Date.now,
    },

    deletedFor: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    description: {
      type: String,
      default: "",
    },
    hiddenFor: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: "User",
        },
        deletedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },

  { timestamps: true },
);

chatSchema.index({ participants: 1 });

chatSchema.pre("save", async function () {
  this.participants = [
    ...new Set(this.participants.map((id) => id.toString())),
  ].map((id) => new mongoose.Types.ObjectId(id));
});

export const Chat = mongoose.model("Chat", chatSchema);
