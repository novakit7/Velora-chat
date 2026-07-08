import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import api from "../../api/axois";
import Loader from "../common/Loader";
import { notify } from "../../utils/toast";
import { formatRelativeDate } from "../../utils/date";

export default function ChatList({ onSelectChat, selectedChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const getChats = async () => {
      try {
        setLoading(true);
        const res = await api.get("/chat");
        const data = res.data.data.filter((chat) => !chat.isGroupChat);
        setChats(data);
      } catch (error) {
        console.error(error);
        notify.error(error?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getChats();
  }, []);

  return (
    <div className="h-full bg-slate-900 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900 p-4 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">Chats</h2>

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
        {loading ? (
          <div className="relative flex h-full items-center justify-center">
            <Loader variant="section" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <h3 className="text-lg font-semibold text-white">No chats yet</h3>

            <p className="text-gray-400 text-center">
              Start a conversation with a friend or create a group.
            </p>
          </div>
        ) : (
          chats.map((chat) => {
            const avatar = chat.otherMember?.avatar?.url;
            const username = chat.otherMember?.username;
            const message = chat.latestMessage?.content || "No messages yet";

            return (
              <button
                key={chat._id}
                onClick={() => onSelectChat(chat)}
                className={`w-full flex items-center justify-between px-4 py-3 transition hover:bg-slate-800 ${
                  selectedChat?._id === chat._id ? "bg-slate-800" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={username}
                        className="h-12 w-12 rounded-full object-cover border-2 border-slate-700"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 font-semibold text-white">
                        {username?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Online Status */}
                    <span
                      className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${
                        chat.isOnline ? "bg-green-500" : "bg-gray-500"
                      }`}
                    />
                  </div>

                  {/* Details */}
                  <div className="text-left">
                    <h3 className="font-medium text-white">{username}</h3>

                    <p className="max-w-44 truncate text-sm text-gray-400">
                      {message}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <span className="text-xs text-gray-400">
                  {formatRelativeDate(chat.latestMessage?.createdAt)}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
