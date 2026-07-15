import model from "../config/ai.config.js";
import { ApiError } from "../utils/ApiError.js";

const askAI = async ({
  modelName,
  messages,
  maxTokens = 300,
  temperature = 0.3,
}) => {
  const result = await model.chatCompletion({
    model: modelName,
    messages,
    max_tokens: maxTokens,
    temperature,
  });

  const response = result?.choices?.[0]?.message?.content?.trim();

  if (!response) {
    throw new ApiError(502, "AI model returned an empty response.");
  }

  return response;
};

// Summarization
const summarize = async (text) => {
  if (!text?.trim()) {
    throw new ApiError(400, "Text is required for summarization.");
  }

  return askAI({
    modelName: "Qwen/Qwen2.5-7B-Instruct",
    messages: [
      {
        role: "system",
        content:
          "You are an expert summarizer. Summarize the provided text into approximately 50 words while preserving the key ideas, main arguments, and important details. Use clear, concise and coherent language. Return only the summary.",
      },
      {
        role: "user",
        content: text.trim(),
      },
    ],
    maxTokens: 300,
    temperature: 0.3,
  });
};

// Translation
const translate = async (text, language) => {
  if (!text?.trim()) {
    throw new ApiError(400, "Text is required for translation.");
  }

  if (!language?.trim()) {
    throw new ApiError(400, "Target language is required.");
  }

  return askAI({
    modelName: "Qwen/Qwen2.5-7B-Instruct",
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the text into ${language}. Return only the translated text.`,
      },
      {
        role: "user",
        content: text.trim(),
      },
    ],
    maxTokens: 300,
    temperature: 0.2,
  });
};

// Chat
const makeQuery = async (messages) => {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new ApiError(400, "Conversation messages are required.");
  }

  return askAI({
    modelName: "Qwen/Qwen2.5-7B-Instruct",
    messages,
    maxTokens: 1600,
    temperature: 0.7,
  });
};

// Grammar
const grammarCheck = async (text) => {
  if (!text?.trim()) {
    throw new ApiError(400, "Text is required for grammar correction.");
  }

  return askAI({
    modelName: "Qwen/Qwen2.5-7B-Instruct",
    messages: [
      {
        role: "system",
        content:
          "You are an expert English editor. Correct grammar, spelling, punctuation and sentence structure while preserving the original meaning. Return only the corrected text.",
      },
      {
        role: "user",
        content: text.trim(),
      },
    ],
    maxTokens: 500,
    temperature: 0.2,
  });
};

export { summarize, translate, makeQuery, grammarCheck };