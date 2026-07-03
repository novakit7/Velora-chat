import React from "react";
import { FiSearch } from "react-icons/fi";

const chats = [
  {
    id: 1,
    name: "Ankit",
    message: "Hey! How are you?",
    time: "10:45",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Rahul",
    message: "Let's meet tomorrow.",
    time: "09:30",
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: "Priya",
    message: "Photo received 📷",
    time: "Yesterday",
    unread: 1,
    online: true,
  },
  {
    id: 4,
    name: "Aman",
    message: "Typing...",
    time: "Yesterday",
    unread: 0,
    online: false,
  },
];

export default function ChatList({
  onSelectChat,
  selectedChat,
}) {
  return (
    <div className="h-full bg-slate-900 rounded-2xl flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900 p-4 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">
          Chats
        </h2>

        <div className="mt-4 flex items-center bg-slate-800 rounded-xl px-3 py-2">
          <FiSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Search chats..."
            className="ml-2 flex-1 bg-transparent outline-none text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Chats */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat.id}
            onClick={() => onSelectChat?.(chat)}
            className={`w-full flex items-center justify-between px-4 py-3 transition hover:bg-slate-800 ${
              selectedChat?.id === chat.id
                ? "bg-slate-800"
                : ""
            }`}
          >
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold">
                  {chat.name[0]}
                </div>

                {chat.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-slate-900" />
                )}
              </div>

              {/* Details */}
              <div className="text-left">
                <h3 className="text-white font-medium">
                  {chat.name}
                </h3>

                <p className="text-sm text-gray-400 truncate max-w-40">
                  {chat.message}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400">
                {chat.time}
              </span>

              {chat.unread > 0 && (
                <span className="mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-xs text-white">
                  {chat.unread}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}