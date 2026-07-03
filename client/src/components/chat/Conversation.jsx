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
    sender: "other",
    text: "Hey! How are you?",
    time: "10:30 AM",
  },
  {
    id: 2,
    sender: "me",
    text: "I'm good! What about you?",
    time: "10:31 AM",
  },
  {
    id: 3,
    sender: "other",
    text: "Doing great 😊",
    time: "10:32 AM",
  },
  {
    id: 4,
    sender: "me",
    text: "Want to work on the project today?",
    time: "10:33 AM",
  },
];

export default function Conversation({ chat, onBack }) {
  // Desktop placeholder
  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-900 rounded-2xl">
        <div className="text-center">
          <h2 className="text-2xl text-white font-semibold">
            Welcome to Velora
          </h2>
          <p className="text-gray-400 mt-2">
            Select a conversation to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-2xl">

      {/* Header */}
      <div className="h-16 border-b border-slate-800 px-4 flex items-center justify-between">

        <div className="flex items-center gap-3">

          {/* Mobile Back */}
          <button
            onClick={onBack}
            className="md:hidden text-white"
          >
            <FiArrowLeft size={22} />
          </button>

          {/* Avatar */}
          <div className="relative">
            <div className="w-11 h-11 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
              {chat.name[0]}
            </div>

            {chat.online && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900" />
            )}
          </div>

          {/* User */}
          <div>
            <h2 className="text-white font-semibold">
              {chat.name}
            </h2>

            <p className="text-sm text-green-400">
              {chat.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4 text-gray-300">
          <FiPhone className="cursor-pointer hover:text-cyan-400" size={20} />
          <FiVideo className="cursor-pointer hover:text-cyan-400" size={20} />
          <FiMoreVertical className="cursor-pointer hover:text-cyan-400" size={20} />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
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
              className={`max-w-xs md:max-w-md px-4 py-3 rounded-2xl ${
                msg.sender === "me"
                  ? "bg-cyan-500 text-white rounded-br-none"
                  : "bg-slate-800 text-white rounded-bl-none"
              }`}
            >
              <p>{msg.text}</p>

              <p className="text-xs opacity-70 mt-1 text-right">
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
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 rounded-full px-5 py-3 text-white outline-none placeholder:text-gray-400"
          />

          <button
            type="submit"
            className="w-12 h-12 rounded-full bg-cyan-500 hover:bg-cyan-600 flex items-center justify-center transition"
          >
            <FiSend className="text-white" size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}