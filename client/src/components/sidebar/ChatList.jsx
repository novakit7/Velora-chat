import React, { useEffect, useState } from "react";
import { FiSearch, FiPlus, FiX } from "react-icons/fi";
import api from "../../api/axois";
import Loader from "../common/Loader";
import { notify } from "../../utils/toast";
import { formatRelativeDate } from "../../utils/date";
import { useNavigate, useParams } from "react-router-dom";
import { FiMessageCircle } from "react-icons/fi";

export default function ChatList() {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [query, setQuery] = useState("");


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

  const filteredChats = chats.filter((chat) => {
    const username = chat.otherMember?.username || "";
    return username.toLowerCase().includes(query.toLowerCase());
  });

  return (
    <div className="h-full bg-slate-900 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Chats
          </h2>

          <button
            onClick={() => navigate("/home/friends")}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-cyan-500 text-white transition-all duration-200 hover:bg-cyan-600"
            title="New Chat"
          >
            <FiPlus size={18} />
          </button>
        </div>

        <div className="mt-4 flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 transition-all duration-200 focus-within:border-cyan-500">
          <FiSearch className="text-slate-400" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search chats..."
            className="ml-3 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="ml-2 rounded-full p-1 cursor-pointer text-slate-400 transition hover:bg-slate-700 hover:text-white"
            >
              <FiX size={18} />
            </button>
          )}
        </div>
      </div>

      {/* Chats */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="relative flex h-full items-center justify-center">
            <Loader variant="section" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-800">
              <FiMessageCircle className="text-4xl text-cyan-400" />
            </div>

            <h3 className="mt-6 text-2xl font-semibold text-white">
              No Chats Yet
            </h3>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              You haven't started any conversations yet. Chat with your friends and stay connected.
            </p>

            <button
              onClick={() => navigate("/home/friends")}
              className="mt-6 flex items-center cursor-pointer gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30"
            >
              <FiMessageCircle />
              Start New Chat
            </button>
          </div>
        ) : (
          filteredChats.map((chat) => {
            const avatar = chat.otherMember?.avatar?.url;
            const username = chat.otherMember?.username;
            const message = chat.latestMessage?.content || "No messages yet";

            return (
              <button
                key={chat._id}
                onClick={() => navigate(`/home/chat/${chat._id}`)}
                className={`group w-full flex cursor-pointer items-center justify-between rounded-xl px-4 py-4 transition-all duration-200 border
    ${chatId === chat._id
                    ? "bg-slate-800 border-cyan-500 shadow-md"
                    : "border-transparent hover:bg-slate-800/60 hover:border-slate-700"
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={username}
                        className="h-11 w-11 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-sm font-semibold text-white">
                        {username?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span
                      className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${chat.isOnline ? "bg-emerald-500" : "bg-slate-500"
                        }`}
                    />
                  </div>

                  {/* Details */}
                  <div className="min-w-0 flex-1 text-left">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {username}
                    </h3>

                    <p className="truncate text-xs text-slate-400">
                      {message}
                    </p>
                  </div>
                </div>

                {/* Time */}
                <span className="ml-3 shrink-0 text-[11px] text-slate-500">
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
