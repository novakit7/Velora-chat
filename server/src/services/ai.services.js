import model from "../config/ai.config.js";

//summarize the text.......
const summarize = async (text) => {
  const result = await model.chatCompletion({
    model: "Qwen/Qwen2.5-7B-Instruct",
    messages: [
      {
        role: "system",
        content:
          "You are an expert summarizer. Summarize the provided text into approximately 100 words while preserving the key ideas, main arguments, and important details. Use clear, concise, and coherent language. Do not add new information, opinions, or explanations. Return only the summary.",
      },
      {
        role: "user",
        content: text,
      },
    ],
    max_tokens: 300,
    temperature: 0.3,
  });

  return result.choices[0].message.content;
};

// treanslate  the  text.......
const translate = async (text, language) => {
  const result = await model.chatCompletion({
    model: "Qwen/Qwen2.5-7B-Instruct",
    messages: [
      {
        role: "system",
        content: `You are a professional translator. Translate the provided text into ${language}. Preserve the original meaning, tone, and formatting as much as possible. Return only the translated text without any explanations, notes, or additional content.`,
      },
      {
        role: "user",
        content: text,
      },
    ],
    max_tokens: 300,
    temperature: 0.2,
  });

  return result.choices[0].message.content;
};

//ask question.....
const makeQuery = async (question) => {
  const result = await model.chatCompletion({
    model: "Qwen/Qwen3-8B",
    messages: [
      {
        role: "system",
        content:
          "You are a helpful, knowledgeable, and accurate AI assistant. Answer the user's questions clearly and concisely. If you are unsure of an answer, say so instead of making up information. Return only the answer.",
      },
      {
        role: "user",
        content: question,
      },
    ],
    max_tokens: 512,
    temperature: 0.7,
  });
  console.log(result.choices[0].message.content);
  return result.choices[0].message.content;
};

const grammarCheck = async (text) => {
  const result = await model.chatCompletion({
    model: "Qwen/Qwen2.5-7B-Instruct",
    messages: [
      {
        role: "system",
        content:
          "You are an expert English editor. Correct any grammar, spelling, punctuation, and sentence structure mistakes while preserving the original meaning and tone. Do not add or remove information. Return only the corrected text.",
      },
      {
        role: "user",
        content: text,
      },
    ],
    max_tokens: 500,
    temperature: 0.2,
  });

  return result.choices[0].message.content;
};

export { summarize, translate, makeQuery, grammarCheck };
