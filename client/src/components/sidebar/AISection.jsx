import { FiSearch, FiPlus } from "react-icons/fi";
import { formatRelativeDate } from "../../utils/date";
import Loader from "../common/Loader";
import { Brain } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axois";
import { notify } from "../../utils/toast";

export default function AISection({ onCreateChat }) {
const [chats, setChats] = useState([]);
const [loading, setLoading] = useState(true);
const navigate = useNavigate();
const { chatId } = useParams();

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

  if (loading) {
    return (
      <div className="relative flex h-full items-center justify-center">
        <Loader variant="section" />
      </div>
    );
  }

  return (
    <div className="h-full rounded-2xl bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Velora-AI
          </h2>

          <button
            onClick={onCreateChat}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-white transition hover:bg-cyan-600"
          >
            <FiPlus />
          </button>
        </div>

        <div className="mt-4 flex items-center rounded-xl bg-slate-800 px-3 py-2">
          <FiSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Search AI chats..."
            className="ml-2 flex-1 bg-transparent text-white outline-none placeholder:text-gray-400"
          />
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        {chats.map((chat) => (
          <button
            key={chat._id}
            onClick={() => navigate(`/home/ai/${chat._id}`)}
            className={`flex w-full items-center justify-between px-4 py-3 transition hover:bg-slate-800 ${chatId === chat._id ? "bg-slate-800" : ""
              }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 font-bold text-white">
                <Brain size={24} />
              </div>

              <div className="text-left">
                <h3 className="font-medium text-white">
                  {chat.title}
                </h3>

                <p className="max-w-44 truncate text-sm text-gray-400">
                  {chat.latestConversation?.prompt || "No messages yet"}
                </p>
              </div>
            </div>

            <span className="text-xs text-gray-400">
              {formatRelativeDate(chat.lastActivity)}
            </span>
          </button>
        ))}

        {chats.length === 0 && (
          <div className="flex h-full items-center justify-center text-gray-400">
            No chats found
          </div>
        )}
      </div>
    </div>
  );
}