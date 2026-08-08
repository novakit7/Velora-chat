import { FiSearch, FiPlus, FiX, FiEdit } from "react-icons/fi";
import { formatRelativeDate } from "../../utils/date";
import Loader from "../common/Loader";
import { Brain } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axois";
import { notify } from "../../utils/toast";
import EditTitleModal from "../models/EditChatTitle";

export default function AISection({ onCreateChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [query, setQuery] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  const openEditModal = (chat) => {
    setSelectedChat(chat);
    setEditOpen(true);
  };

  const fetchAIChats = async () => {
    try {
      setLoading(true);

      const res = await api.get("/ai/chat");

      setChats(res.data.data);
    } catch (error) {
      console.error(error);
      notify.error("Couldn't load AI chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAIChats();
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.title.toLowerCase().includes(query.toLowerCase())
  );


  const handleEditTitle = async (title) => {
    try {
      setEditLoading(true);

      await api.patch(`/ai/chat/${selectedChat._id}`, {
        title,
      });

      notify.success("Title updated");

      // Update sidebar immediately
      setChats((prev) =>
        prev.map((chat) =>
          chat._id === selectedChat._id
            ? { ...chat, title }
            : chat
        )
      );

      navigate(`/home/ai/${selectedChat._id}`, { replace: true });
      navigate(0);

      setEditOpen(false);
      setSelectedChat(null);
    } catch (err) {
      console.error(err);
      notify.error(
        err?.response?.data?.message || "Couldn't update title"
      );
    } finally {
      setEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex h-full items-center justify-center">
        <Loader variant="section" />
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl bg-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Velora-AI
          </h2>

          <button
            onClick={onCreateChat}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-cyan-500 text-white transition-all duration-200 hover:bg-cyan-600"
            title="New AI Chat"
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
            placeholder="Search AI chats..."
            className="ml-3 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded-full p-1 cursor-pointer text-slate-400 transition hover:bg-slate-700 hover:text-white"
              title="Clear search"
            >
              <FiX size={17} />
            </button>
          )}
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto all-scroll">
        <div className="space-y-1 p-1">
  {filteredChats.map((chat) => (
          <div
            key={chat._id}
            className={`group flex items-center justify-between rounded-xl border px-4 py-4 transition-all duration-200
        ${chatId === chat._id
                ? "border-cyan-500 bg-slate-800 shadow-md"
                : "border-transparent hover:border-slate-700 hover:bg-slate-800/60"
              }`}
          >
            <button
              onClick={() => navigate(`/home/ai/${chat._id}`)}
              className="flex flex-1 items-center gap-3 text-left min-w-0 cursor-pointer"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-cyan-500 text-white">
                <Brain size={22} />
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="truncate text-sm font-semibold text-white">
                  {chat.title}
                </h3>

                <p className="truncate text-xs text-slate-400">
                  {chat.latestConversation?.prompt || "No messages yet"}
                </p>
              </div>
            </button>

            {/* Right Side */}
            <div className="ml-4 flex shrink-0 items-center gap-3">
              <span className="text-[11px] text-slate-500 whitespace-nowrap">
                {formatRelativeDate(chat.lastActivity)}
              </span>

              <button
                onClick={() => openEditModal(chat)}
                className="flex h-10 w-10 items-center cursor-pointer justify-center rounded-xl border border-transparent text-slate-400 transition-all duration-200 hover:border-slate-700 hover:bg-slate-700 hover:text-cyan-400 active:scale-95"
                title="Rename chat"
              >
                <FiEdit size={18} />
              </button>
            </div>
          </div>
        ))}
</div>

        {filteredChats.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <div className="flex h-24 w-24 items-center justify-center rounded-full border border-slate-700 bg-slate-800">
              <Brain size={46} className="text-cyan-400" />
            </div>

            <h2 className="mt-6 text-2xl font-semibold text-white">
              {query ? "No Matching Chats" : "No AI Chats Yet"}
            </h2>

            <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
              {query
                ? "Try another keyword or clear your search."
                : "Create your first AI conversation and start asking questions."}
            </p>

            {!query && (
              <button
                onClick={onCreateChat}
                className="mt-6 rounded-xl border cursor-pointer border-cyan-500 bg-cyan-500 px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-cyan-600 hover:border-cyan-400"
              >
                <FiPlus className="mr-2 inline" />
                New AI Chat
              </button>
            )}

            {query && (
              <button
                onClick={() => setQuery("")}
                className="mt-6 rounded-xl border cursor-pointer border-slate-700 px-5 py-3 text-slate-300 transition-all duration-200 hover:border-cyan-500 hover:bg-slate-800 hover:text-cyan-400"
              >
                Clear Search
              </button>
            )}
          </div>
        )}
      </div>
      <EditTitleModal
        open={editOpen}
        onClose={() => {
          setEditOpen(false);
          setSelectedChat(null);
        }}
        onConfirm={handleEditTitle}
        loading={editLoading}
        initialTitle={selectedChat?.title || ""}
      />
    </div>
  );
}