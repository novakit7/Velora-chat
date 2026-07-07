import React from "react";
import { FiSearch, FiPlus } from "react-icons/fi";

const chats = [
  {
    _id: "1",
    name: "React Hooks Guide",
    message: "Explain useEffect with examples.",
    time: "2 min",
    unread: 0,
  },
  {
    _id: "2",
    name: "Resume Review",
    message: "Your resume has been improved successfully.",
    time: "15 min",
    unread: 2,
  },
  {
    _id: "3",
    name: "MongoDB Aggregation",
    message: "Let's build an aggregation pipeline.",
    time: "1 hr",
    unread: 0,
  },
  {
    _id: "4",
    name: "Summarizer",
    message: "Summary generated successfully.",
    time: "Yesterday",
    unread: 1,
  },
];

export default function AISection({
  selectedChat,
  onSelectChat,
  onCreateChat,
}) {
  return (
    <div className="h-full bg-slate-900 rounded-2xl flex flex-col">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900 p-4 border-b border-slate-800">

        <div className="flex items-center justify-between">

          <h2 className="text-xl font-semibold text-white">
            AI Chats
          </h2>

          <button
            onClick={onCreateChat}
            className="w-10 h-10 rounded-xl bg-cyan-500 hover:bg-cyan-600 flex items-center justify-center text-white transition"
          >
            <FiPlus />
          </button>

        </div>

        <div className="mt-4 flex items-center bg-slate-800 rounded-xl px-3 py-2">

          <FiSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Search AI chats..."
            className="ml-2 flex-1 bg-transparent outline-none text-white placeholder:text-gray-400"
          />

        </div>

      </div>

      {/* Chat List */}

      <div className="flex-1 overflow-y-auto">

        {chats.map((chat) => (
          <button
            key={chat._id}
            onClick={() => onSelectChat(chat)}
            className={`w-full flex items-center justify-between px-4 py-3 transition hover:bg-slate-800 ${
              selectedChat?._id === chat._id
                ? "bg-slate-800"
                : ""
            }`}
          >

            <div className="flex items-center gap-3">

              <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                🤖
              </div>

              <div className="text-left">

                <h3 className="text-white font-medium">
                  {chat.name}
                </h3>

                <p className="text-sm text-gray-400 truncate max-w-44">
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