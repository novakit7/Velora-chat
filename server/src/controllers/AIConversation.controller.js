import { AIChat } from "../models/aiChat.model.js";
import mongoose from "mongoose";
import { AIConversation } from "../models/aiConversation.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { summarize, translate, grammarCheck } from "../services/ai.services.js";

const createChat = asyncHandler(async (req, res) => {
  const { title } = req.body;

  const chat = await AIChat.create({
    user: req.user._id,
    title: title?.trim() || "New Chat",
    lastActivity: new Date(),
  });

  return res
    .status(201)
    .json(new ApiResponse(201, chat, "AI chat created successfully."));
});

const sendMessage = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { prompt } = req.body;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id.");
  }

  if (!prompt?.trim()) {
    throw new ApiError(400, "Prompt is required.");
  }

  const chat = await AIChat.findOne({
    _id: chatId,
    user: req.user._id,
  }).lean();

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  // Only fetch last 5 conversations
  const history = await AIConversation.find({
    chat: chatId,
  })
    .sort({ createdAt: -1 })
    .limit(5)
    .lean();

  history.reverse();

  const messages = [
    {
      role: "system",
      content: "You are a helpful AI assistant.",
    },
  ];

  for (const item of history) {
    messages.push(
      {
        role: "user",
        content: item.prompt,
      },
      {
        role: "assistant",
        content: item.response,
      },
    );
  }

  messages.push({
    role: "user",
    content: prompt.trim(),
  });

  console.log(messages);
  const response = await makeQuery(messages);

  const conversation = await AIConversation.create({
    user: req.user._id,
    chat: chatId,
    prompt: prompt.trim(),
    response,
    model: "Qwen/Qwen3-8B",
  });

  await AIChat.updateOne(
    { _id: chatId },
    {
      $set: {
        lastActivity: new Date(),
      },
    },
  );

  return res
    .status(200)
    .json(
      new ApiResponse(200, conversation, "Response generated successfully."),
    );
});

const getChats = asyncHandler(async (req, res) => {
  const chats = await AIChat.find({
    user: req.user._id,
  })
    .sort({ lastActivity: -1 })
    .lean();

  return res
    .status(200)
    .json(new ApiResponse(200, chats, "AI chats fetched successfully."));
});

const getChatMessages = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id.");
  }

  const chat = await AIChat.findOne({
    _id: chatId,
    user: req.user._id,
  }).lean();

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  const conversations = await AIConversation.find({
    chat: chatId,
  })
    .sort({ createdAt: 1 })
    .select("-__v")
    .lean();

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        chat,
        conversations,
      },
      "Chat messages fetched successfully.",
    ),
  );
});

const renameChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;
  const { title } = req.body;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id.");
  }

  if (!title?.trim()) {
    throw new ApiError(400, "Title is required.");
  }

  const chat = await AIChat.findOneAndUpdate(
    {
      _id: chatId,
      user: req.user._id,
    },
    {
      $set: {
        title: title.trim(),
      },
    },
    {
      returnDocument: "after",
      runValidators: true,
    },
  );

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, chat, "Chat renamed successfully."));
});

const deleteChat = asyncHandler(async (req, res) => {
  const { chatId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(chatId)) {
    throw new ApiError(400, "Invalid chat id.");
  }

  const chat = await AIChat.findOne({
    _id: chatId,
    user: req.user._id,
  });

  if (!chat) {
    throw new ApiError(404, "Chat not found.");
  }

  await Promise.all([
    AIConversation.deleteMany({
      chat: chatId,
    }),
    AIChat.findByIdAndDelete(chatId),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Chat deleted successfully."));
});

const translateText = asyncHandler(async (req, res) => {
  const { text, language } = req.body;

  if (!text?.trim()) {
    throw new ApiError(400, "Text is required.");
  }

  if (!language?.trim()) {
    throw new ApiError(400, "Target language is required.");
  }

  const translatedText = await translate(text, language);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        originalText: text,
        translatedText,
        language,
      },
      "Text translated successfully.",
    ),
  );
});

const summarizeText = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text?.trim()) {
    throw new ApiError(400, "Text is required.");
  }

  const summary = await summarize(text);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        originalText: text,
        summary,
      },
      "Text summarized successfully.",
    ),
  );
});

const checkGrammar = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text?.trim()) {
    throw new ApiError(400, "Text is required.");
  }

  const correctedText = await grammarCheck(text);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        originalText: text,
        correctedText,
      },
      "Grammar checked successfully.",
    ),
  );
});

export {
  createChat,
  sendMessage,
  getChatMessages,
  getChats,
  renameChat,
  deleteChat,
  translateText,
  summarizeText,
  checkGrammar,
};
