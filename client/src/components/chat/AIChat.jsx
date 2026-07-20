import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { notify } from "../../utils/toast";
import {
  FiArrowLeft,
  FiEdit2,
  FiMoreVertical,
  FiSend,
  FiTrash2,
} from "react-icons/fi";
import { Brain } from "lucide-react";
import TypingIndicator from "./TypingIndicator";
import { formatDateTime } from "../../utils/date";
import api from "../../api/axois";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Loader } from "lucide-react";
export default function AIChat({
  creating,
  onBack,
  onChatCreated,
}) {
  const [loadingChat, setLoadingChat] = useState(false);
  const [sending, setSending] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState("");
  const { chatId } = useParams();
  const [chat, setChat] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
  };

  useEffect(() => {
    if (!chatId || creating) {
      setChat(null);
      setMessages([]);
      return;
    }

    const getChat = async () => {
      try {
        setLoadingChat(true);

        const res = await api.get(`/ai/chat/${chatId}`);

        setChat(res.data.data);
        setMessages(res.data.data.conversations || []);
      } catch (error) {
        console.error(error);
        notify.error(
          error?.response?.data?.message || "Failed to load chat."
        );
      } finally {
        setLoadingChat(false);
      }
    };

    getChat();
  }, [chatId, creating]);

  useEffect(() => {
    if (!loadingChat && messages.length > 0) {
      setTimeout(() => {
        scrollToBottom("auto");
      }, 100);
    }
  }, [loadingChat]);

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom("smooth");
    }
  }, [messages]);

  const createChat = async () => {
    if (!title.trim()) {
      return notify.error("Please enter a title.");
    }

    if (!prompt.trim()) {
      return notify.error("Please enter your first prompt.");
    }

    try {
      setSending(true);

      // Create chat
      const { data: chatRes } = await api.post("/ai/chat", {
        title,
      });
      const newChat = chatRes.data;

      // Send first prompt
      const { data: messageRes } = await api.post(
        `/ai/chat/${newChat._id}/message`,
        {
          prompt,
        }
      );
      setMessages([messageRes.data]);

      setTitle("");
      setPrompt("");

      onChatCreated(newChat);
    } catch (error) {
      console.error(error);

      notify.error(
        error?.response?.data?.message ||
        "Failed to create conversation."
      );
    } finally {
      setSending(false);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    try {
      setSending(true);
      const { data } = await api.post(
        `/ai/chat/${chat.chat._id}/message`,
        {
          prompt,
        }
      );

      setMessages((prev) => [...prev, data.data]);

      setPrompt("");
    } catch (error) {
      console.error(error);

      notify.error(
        error?.response?.data?.message ||
        "Failed to send message."
      );
    } finally {
      setSending(false);
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
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask me anything..."
                className="w-full resize-none rounded-xl bg-slate-700 px-4 py-3 text-white outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>

            <button
              disabled={sending}
              onClick={createChat}
              className="w-full rounded-xl bg-cyan-500 py-3 font-semibold text-white transition hover:bg-cyan-600 disabled:opacity-50"
            >
              {sending ? "Creating..." : "Start Conversation"}
            </button>
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full flex-col rounded-2xl bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <button className="text-white md:hidden" onClick={onBack}>
            <FiArrowLeft size={22} />
          </button>

          <div className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-white">
              <Brain size={24} />
            </div>

            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500" />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-white">
              {chat?.title}
            </h2>

            <p className="text-sm text-gray-400">
              Velora AI
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-300">
          <button className="transition hover:text-cyan-400">
            <FiEdit2 size={20} />
          </button>

          <button className="transition hover:text-red-500">
            <FiTrash2 size={20} />
          </button>

          <button className="transition hover:text-cyan-400">
            <FiMoreVertical size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-5 all-scroll">
        {loadingChat ? (
          <div className="flex h-full items-center justify-center">
            <Loader variant="section" />
          </div>
        ) : (
          <div className="space-y-6">
            {messages.map((message) => (
              <React.Fragment key={message._id}>
                {/* User */}
                <div className="flex justify-end">
                  <div className="max-w-[75%] rounded-2xl rounded-br-md bg-cyan-500 px-4 py-3 text-white">
                    <p className="whitespace-pre-wrap">
                      {message.prompt}
                    </p>

                    <div className="mt-2 text-right text-xs text-white/80">
                      {formatDateTime(message.createdAt)}
                    </div>
                  </div>
                </div>

                {/* AI */}
                <div className="flex justify-start">
                  <div className="max-w-[75%] rounded-2xl rounded-bl-md border border-slate-700 bg-slate-800 px-4 py-3">
                    <p className="mb-2 text-xs font-semibold text-cyan-400">
                      Velora AI
                    </p>

                    <div className="prose prose-invert max-w-none text-text">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {message.response}
                      </ReactMarkdown>
                    </div>

                    <div className="mt-3 text-right text-xs text-slate-400">
                      {formatDateTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            ))}

            {sending && (
              <TypingIndicator />
            )}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 p-4">
        <form
          onSubmit={sendMessage}
          className="flex items-center gap-3"
        >
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type a message..."
            disabled={sending}
            className="flex-1 rounded-full bg-slate-800 px-5 py-3 text-white outline-none placeholder:text-gray-400 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={sending || !prompt.trim()}
            className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiSend size={20} className="text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}