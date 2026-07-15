import React, { useEffect, useState } from "react";
import { FiSearch, FiPlus } from "react-icons/fi";
import { formatRelativeDate } from "../../utils/date";
import { notify } from "../../utils/toast";
import Loader from "../common/Loader";
import api from "../../api/axois";
import { Brain } from "lucide-react";

export default function AISection({
  chats,
  loading,
  selectedChat,
  onSelectChat,
  onCreateChat,
}) {


  if (loading) {
    return (
      <div className="relative flex h-full items-center justify-center">
        <Loader variant="section" />
      </div>
    );
  }

  return (
    <div className="h-full bg-slate-900 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900 p-4 border-b border-slate-800">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Velora-AI
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
              selectedChat?._id === chat._id ? "bg-slate-800" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                <Brain size={24} />
              </div>

              <div className="text-left">
                <h3 className="text-white font-medium">
                  {chat.title}
                </h3>

                <p className="text-sm text-gray-400 truncate max-w-44">
                  {chat.latestConversation?.prompt || "No messages yet"}
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs text-gray-400">
                {formatRelativeDate(chat.lastActivity)}
              </span>
            </div>
          </button>
        ))}

        {!loading && chats.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-400">
            No chats found
          </div>
        )}
      </div>
    </div>
  );
}