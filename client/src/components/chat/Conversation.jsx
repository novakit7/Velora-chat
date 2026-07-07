import React from "react";
import {
  FiArrowLeft,
  FiPhone,
  FiVideo,
  FiMoreVertical,
  FiSend,
} from "react-icons/fi";

const messages = [
  {
    id: 1,
    name: "Ankit",
    type: "chat",
    online: true,
  },
  {
    id: 2,
    name: "React Developers",
    type: "group",
  },
  {
    id: 3,
    name: "Velora AI",
    type: "ai",
  },
];

export default function Conversation({ chat, onBack }) {
  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 rounded-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">
            Welcome to Velora
          </h2>

          <p className="mt-2 text-gray-400">
            Select a conversation to start chatting.
          </p>
        </div>
      </div>
    );
  }

  const isAI = chat.type === "ai";
  const isGroup = chat.type === "group";

  return (
    <div className="flex h-full flex-col rounded-2xl bg-slate-900">
      {/* Header */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="text-white md:hidden"
          >
            <FiArrowLeft size={22} />
          </button>

          {/* Avatar */}
          <div className="relative">
            <div
              className={`flex h-11 w-11 items-center justify-center rounded-full font-bold text-white ${
                isAI
                  ? "bg-linear-to-br from-cyan-500 to-blue-600"
                  : isGroup
                  ? "bg-violet-600"
                  : "bg-cyan-500"
              }`}
            >
              {isAI ? "🤖" : isGroup ? "👥" : chat.name[0]}
            </div>

            {!isAI && chat.online && (
              <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500" />
            )}
          </div>

          {/* Details */}
          <div>
            <h2 className="font-semibold text-white">
              {chat.name}
            </h2>

            <p
              className={`text-sm ${
                isAI
                  ? "text-cyan-400"
                  : isGroup
                  ? "text-violet-400"
                  : chat.online
                  ? "text-green-400"
                  : "text-gray-400"
              }`}
            >
              {isAI
                ? "AI Assistant"
                : isGroup
                ? `${chat.members || 0} Members`
                : chat.online
                ? "Online"
                : "Offline"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 text-gray-300">
          {!isAI && (
            <>
              <FiPhone
                size={20}
                className="cursor-pointer transition hover:text-cyan-400"
              />

              <FiVideo
                size={20}
                className="cursor-pointer transition hover:text-cyan-400"
              />
            </>
          )}

          <FiMoreVertical
            size={20}
            className="cursor-pointer transition hover:text-cyan-400"
          />
        </div>
      </div>

      {/* AI Toolbar */}
      {isAI && (
        <div className="border-b border-slate-800 px-4 py-3">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {[
              "Translate",
              "Summarize",
              "Grammar",
              "Rewrite",
              "Explain",
            ].map((tool) => (
              <button
                key={tool}
                className="whitespace-nowrap rounded-full bg-slate-800 px-4 py-2 text-sm text-gray-300 transition hover:bg-slate-700"
              >
                {tool}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto px-6 py-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${
              msg.sender === "me"
                ? "justify-end"
                : "justify-start"
            }`}
          >
            <div
              className={`max-w-xs rounded-2xl px-4 py-3 md:max-w-md ${
                msg.sender === "me"
                  ? "rounded-br-none bg-cyan-500 text-white"
                  : isAI
                  ? "rounded-bl-none border border-cyan-500/20 bg-slate-800 text-white"
                  : "rounded-bl-none bg-slate-800 text-white"
              }`}
            >
              <p>{msg.text}</p>

              <p className="mt-1 text-right text-xs opacity-70">
                {msg.time}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 p-4">
        <form className="flex items-center gap-3">
          <input
            type="text"
            placeholder={
              isAI
                ? "Ask Velora AI..."
                : "Type a message..."
            }
            className="flex-1 rounded-full bg-slate-800 px-5 py-3 text-white outline-none placeholder:text-gray-400"
          />

          <button
            type="submit"
            className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 transition hover:bg-cyan-600"
          >
            <FiSend size={20} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
