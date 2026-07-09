import React, { useState, useEffect } from "react";
import { notify } from "../../utils/toast";
import {
  FiArrowLeft,
  FiEdit2,
  FiMoreVertical,
  FiSend,
  FiTrash2,
} from "react-icons/fi";
import { Brain } from "lucide-react";
import Loader from "../common/Loader";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { formatDateTime } from "../../utils/date";
import api from "../../api/axois";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function AIChat({
  chat,
  creating,
  onBack,
  onChatCreated,
}) {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [prompt, setprompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState("");

  useEffect(() => {
    const getChats = async () => {
      try {
        setLoading(true);
        const res = await api.get(`ai/chat/${chat._id}`);

        console.log(res.data);
        setMessages(res.data?.data?.conversations);
      } catch (error) {
        console.error(error);
        notify.error(error?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    if (chat) {
      getChats();
    }
  }, [chat]);


  const createChat = async () => {
    if (!title.trim()) {
      notify.error("Please enter a title.");
      return;
    }

    if (!prompt.trim()) {
      notify.error("Please enter your first prompt.");
      return;
    }

    try {
      setLoading(true);

      // Create chat
      const chatRes = await api.post("/ai/chat", {
        title,
      });

      const newChat = chatRes.data.data;

      // Send first prompt
      await api.post(`/ai/chat/${newChat._id}/message`, {
        prompt,
      });

      onChatCreated(newChat);
    } catch (error) {
      console.error(error);

      notify.error(
        error?.response?.data?.message || "Failed to create conversation."
      );
    } finally {
      setLoading(false);
    }
  };

  if (!chat && !creating) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">
            Welcome to Velora
          </h2>

          <p className="mt-2 text-gray-400">
            Select a conversation to ask something.
          </p>
        </div>
      </div>
    );
  }

  if (creating) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-slate-900 p-6">
        <div className="w-full max-w-2xl rounded-2xl border border-slate-700 bg-slate-800 p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white">
              <Brain size={24} />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-white">
                New AI Chat
              </h2>

              <p className="text-sm text-gray-400">
                Give your chat a title and ask your first question.
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                Conversation Title
              </label>

              <input
                autoFocus
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="React Interview Preparation"
                className="w-full rounded-xl bg-slate-700 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-300">
                First Prompt
              </label>

              <textarea
                rows={6}
                value={prompt}
                onChange={(e) => setprompt(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full resize-none rounded-xl bg-slate-700 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              disabled={loading}
              onClick={createChat}
              className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50"
            >
              {loading ? "Creating..." : "Start Conversation"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    console.log(prompt);
    try {
      setLoading(true);
      const res = await api.post(`/ai/chat/${chat._id}/message`, {
        prompt,
      });
      setMessages((prev) => [
        ...prev, res.data?.data
      ])
    } catch (error) {
      console.error(error);
      notify.error(error?.response?.data?.message || "Something went wrong while sending a message.");
    } finally {
      setprompt("")
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col rounded-2xl bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-white" onClick={onBack}>
            <FiArrowLeft size={22} />
          </button>

          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white">
              <Brain size={24} />
            </div>

            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500" />
          </div>

          <div>
            <h2 className="font-semibold text-white text-lg">
              {chat.title}
            </h2>

            <p className="text-sm text-gray-400">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-300">
          <button className="hover:text-cyan-400 transition">
            <FiEdit2 size={20} />
          </button>

          <button className="hover:text-red-500 transition">
            <FiTrash2 size={20} />
          </button>

          <button className="hover:text-cyan-400 transition">
            <FiMoreVertical size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loading ? (
          <div className="relative flex h-full items-center justify-center">
            <Loader variant="section" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-6">
              {messages.map((message) => (
                <React.Fragment key={message._id}>
                  {/* User Prompt */}
                  <div className="flex justify-end">
                    <div className="max-w-[75%] rounded-2xl rounded-br-md bg-cyan-500 px-4 py-3 text-white shadow">
                      <p className="whitespace-pre-wrap text-sm">
                        {message.prompt}
                      </p>

                      <div className="mt-2 text-right text-[11px] text-white/80">
                        {formatDateTime(message.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* AI Response */}
                  <div className="flex justify-start">
                    <div className="max-w-[75%] rounded-2xl rounded-bl-md border border-slate-700 bg-slate-800 px-4 py-3 text-slate-100 shadow">
                      <p className="mb-2 text-xs font-semibold text-cyan-400">
                        Velora AI
                      </p>

                      <div className="prose prose-invert max-w-none prose-p:my-2 prose-pre:bg-slate-900">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {message.response}
                        </ReactMarkdown>
                      </div>

                      <div className="mt-3 text-right text-[11px] text-slate-400">
                        {formatDateTime(message.createdAt)}
                      </div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 p-4">
        <form className="flex items-center gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setprompt(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-slate-800 px-5 py-3 text-white outline-none placeholder:text-gray-400"
          />

          <button
            type="submit"
            disabled={loading}
            onClick={sendMessage}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 transition hover:bg-cyan-600"
          >
            <FiSend size={20} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
