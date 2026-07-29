import React, { useState, useEffect, useRef } from "react";
import { notify } from "../../utils/toast";
import {
  FiArrowLeft,
  FiEdit2,
  FiMoreVertical,
  FiSend,
  FiTrash2,
  FiMessageCircle
} from "react-icons/fi";
import Loader from "../common/Loader";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { formatDateTime } from "../../utils/date";
import api from "../../api/axois";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import DeleteChatModal from "../models/DeleteModel";

export default function Conversation({ onBack }) {
  const [loadingChat, setLoadingChat] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);

  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState(null);

  const { chatId } = useParams();

  const messagesEndRef = useRef(null);
  const firstLoad = useRef(true);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useNavigate();

  const scrollToBottom = (behavior = "smooth") => {
    messagesEndRef.current?.scrollIntoView({
      behavior,
      block: "end",
    });
  };

  useEffect(() => {
    if (!messages.length) return;

    requestAnimationFrame(() => {
      scrollToBottom(firstLoad.current ? "auto" : "smooth");
      firstLoad.current = false;
    });
  }, [messages]);


  useEffect(() => {
    if (!chatId) return;

    const fetchChat = async () => {
      try {
        setLoadingChat(true);

        const res = await api.get(`/chat/${chatId}`);

        setChat(res.data.data);
      } catch (err) {
        console.error(err);

        notify.error(
          err?.response?.data?.message ||
          "Failed to load chat."
        );
      } finally {
        setLoadingChat(false);
      }
    };

    fetchChat();
  }, [chatId]);

  useEffect(() => {
    if (!chat?._id) return;

    const getMessages = async () => {
      try {
        setLoadingMessages(true);

        const res = await api.get(
          `/chat/message/${chat._id}?page=1&limit=20`
        );

        setMessages(res.data.data.messages || []);
      } catch (err) {
        console.error(err);

        notify.error(
          err?.response?.data?.message ||
          "Couldn't load messages."
        );
      } finally {
        setLoadingMessages(false);
      }
    };

    getMessages();
  }, [chat?._id]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = msg.trim();

    if (!text || sending) return;

    // Clear input immediately
    setMsg("");

    try {
      setSending(true);

      const res = await api.post(
        `/message/${chat._id}/message`,
        {
          content: text,
        }
      );

      setMessages((prev) => [...prev, res.data.data]);
    } catch (error) {
      console.error(error);

      // Restore text if sending fails
      setMsg(text);

      notify.error(
        error?.response?.data?.message ||
        "Something went wrong while sending the message."
      );
    } finally {
      setSending(false);
    }
  };

  const deleteChat = async () => {
    try {
      setDeleting(true);

      await api.delete(`/chat/delete/${chat._id}`);

      notify.success("Chat deleted successfully.");

      setShowDeleteModal(false);

      // Go back to chat list
      navigate("/home", { replace: true });
      navigate(0);

    } catch (error) {
      notify.error(
        error?.response?.data?.message || "Failed to delete chat."
      );
    } finally {
      setDeleting(false);
    }
  };

  // No chat selected
  if (!chat) {
    return (
      <div className="flex h-full items-center justify-center rounded-2xl bg-slate-900">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-white">
            Welcome to Velora
          </h2>

          <p className="mt-2 text-gray-400">
            Select a conversation to start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          <button className="md:hidden text-white" onClick={onBack}>
            <FiArrowLeft size={22} />
          </button>

          <div className="relative">
            <div className="h-12 w-12 rounded-full bg-cyan-500">
              <img
                src={
                  chat.isGroupChat
                    ? chat.groupAvatar?.url
                    : chat.otherMember?.avatar.url
                }
                className="rounded-full"
                alt=""
              />
            </div>

            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500" />
          </div>

          <div>
            <h2 className="font-semibold text-white text-lg">
              {chat.isGroupChat ? chat.groupName : chat.otherMember?.username}
            </h2>

            <p className="text-sm text-gray-400">Online</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-gray-300">
          <button
            onClick={() => setShowDeleteModal(true)}
            className="hover:text-red-500 transition">
            <FiTrash2 size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loadingMessages ? (
          <div className="relative flex h-full items-center justify-center">
            <Loader variant="section" />
          </div>
        ) : (
          messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">

              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-800 ring-1 ring-slate-700">
                <FiMessageCircle className="text-5xl text-cyan-400" />
              </div>

              <h2 className="mt-6 text-2xl font-semibold text-white">
                No Messages Yet
              </h2>

              <p className="mt-3 max-w-sm text-sm leading-6 text-slate-400">
                Start the conversation by sending your first message.
              </p>

              <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-3 text-sm text-cyan-300">
                👋 Say hello and break the ice!
              </div>

            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isMe = message.sender?._id === user?._id;

                return (
                  <div
                    key={message._id}
                    className={`flex mb-4 transition-all duration-300 ${isMe ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`flex items-end gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : ""
                        }`}
                    >
                      <img
                        src={message.sender?.avatar?.url}
                        alt={message.sender?.username}
                        className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                      />

                      <div
                        className={`max-w-md rounded-2xl px-4 py-3 shadow-md transition-all duration-200 wrap-break-words ${isMe
                            ? "rounded-br-md bg-cyan-500 text-white"
                            : "rounded-bl-md border border-slate-700 bg-slate-800 text-slate-100"
                          }`}
                      >
                        {!isMe && (
                          <p className="mb-1 text-xs font-semibold text-cyan-400">
                            {message.sender?.username}
                          </p>
                        )}

                        <p className="text-sm leading-6">
                          {message.content}
                        </p>

                        <div
                          className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${isMe ? "text-white/80" : "text-slate-400"
                            }`}
                        >
                          <span>{formatDateTime(message.createdAt)}</span>

                          {isMe && (
                            <span className="font-bold">✓✓</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 p-4">
        <form className="flex items-center gap-3" onSubmit={sendMessage}>
          <input
            type="text"
            value={msg}
            disabled={sending}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-slate-800 px-5 py-3 text-white outline-none placeholder:text-gray-400 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={sending}
            className="relative flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 transition hover:bg-cyan-600"
          >
            {sending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FiSend size={20} className="text-white" />
            )}
          </button>
        </form>
      </div>
      <DeleteChatModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={deleteChat}
        loading={deleting}
      />
    </div>
  );
}
