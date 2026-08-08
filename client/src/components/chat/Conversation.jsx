import React, { useState, useEffect, useRef } from "react";
import { notify } from "../../utils/toast";
import {
  FiArrowLeft,
  FiEdit2,
  FiMoreVertical,
  FiSend,
  FiTrash2,
  FiMessageCircle,
} from "react-icons/fi";
import Loader from "../common/Loader";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { formatDateTime } from "../../utils/date";
import api from "../../api/axois";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import DeleteChatModal from "../models/DeleteModel";
import GroupInfoModal from "../models/GroupInfoModel";
import UserInfoModal from "../models/UserInfoModal";
import { formatRelativeDate } from "../../utils/date";
import { useOnlineStatus } from "../../context/OnlineStatusContext";

export default function Conversation({ onBack }) {
  const [loadingChat, setLoadingChat] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [sending, setSending] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);

  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [chat, setChat] = useState(null);

  const menuRef = useRef(null);
  const messagesRef = useRef(null);
  const { isUserOnline } = useOnlineStatus();
  const online =
    !chat?.isGroupChat &&
    isUserOnline(chat?.otherMember?._id);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

        notify.error(err?.response?.data?.message || "Failed to load chat.");
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

        const res = await api.get(`/chat/message/${chat._id}?page=1&limit=20`);

        setMessages(res.data.data.messages || []);
      } catch (err) {
        console.error(err);

        notify.error(err?.response?.data?.message || "Couldn't load messages.");
      } finally {
        setLoadingMessages(false);
      }
    };

    getMessages();
  }, [chat?._id]);

  useEffect(() => {
    if (!sending) {
      messagesRef.current?.focus();
    }
  }, [sending]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const text = msg.trim();

    if (!text || sending) return;

    // Clear input immediately
    setMsg("");

    try {
      setSending(true);

      const res = await api.post(`/message/${chat._id}/message`, {
        content: text,
      });

      setMessages((prev) => [...prev, res.data.data]);
    } catch (error) {
      console.error(error);

      // Restore text if sending fails
      setMsg(text);

      notify.error(
        error?.response?.data?.message ||
        "Something went wrong while sending the message.",
      );
    } finally {
      setSending(false);
    }
  };

  const groupSubtitle = (participants = []) => {
    const names = participants
      .filter((p) => p._id !== user._id) // Remove current user
      .map((p) => p.username);

    if (names.length <= 3) {
      return names.join(", ");
    }

    return `${names.slice(0, 3).join(", ")} +${names.length - 3}`;
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
      notify.error(error?.response?.data?.message || "Failed to delete chat.");
    } finally {
      setDeleting(false);
    }
  };

  // No chat selected

  if (!chat) {
    return (
      <div className="flex h-full flex-col rounded-2xl bg-slate-900"><Loader variant="button"/></div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-2xl bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div
          onClick={() => {
            if (chat.isGroupChat) {
              setShowGroupModal(true);
            } else {
              setShowUserModal(true);
            }
          }}
          className={`flex items-center gap-3 ${chat ? "cursor-pointer" : ""}`}
        >
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
                className="h-12 w-12 rounded-full object-cover border border-slate-700"
                alt=""
              />
            </div>

            <span
              className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 ${isUserOnline(chat?.otherMember?._id)
                ? "bg-green-500"
                : "bg-gray-500"
                }`}
            />
          </div>

          <div>
            <h2 className="font-semibold text-white text-lg">
              {chat.isGroupChat ? chat.groupName : chat.otherMember?.username}
            </h2>

            <p className="text-sm text-gray-400">
              {chat.isGroupChat
                ? groupSubtitle(chat.participants)
                : online
                  ? <span className="text-green-400">online</span>
                  : `Last seen ${formatRelativeDate(chat.otherMember.lastSeen)}`}
            </p>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl transition-all duration-200 hover:bg-slate-800"
          >
            <FiMoreVertical size={20} className="text-slate-400" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 z-20 w-44 overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setShowDeleteModal(true);
                }}
                className="flex w-full items-center cursor-pointer gap-3 px-4 py-3 text-red-400 transition hover:bg-slate-800"
              >
                <FiTrash2 size={18} />
                Delete Chat
              </button>
            </div>
          )}

          <DeleteChatModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            onDelete={deleteChat}
            loading={deleting}
          />
          <GroupInfoModal
            isOpen={showGroupModal}
            onClose={() => setShowGroupModal(false)}
            chat={chat}
            setChat={setChat}
          />
          <UserInfoModal
            isOpen={showUserModal}
            onClose={() => setShowUserModal(false)}
            user={chat.otherMember}
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-5">
        {loadingMessages ? (
          <div className="relative flex h-full items-center justify-center">
            <Loader variant="section" />
          </div>
        ) : messages.length === 0 ? (
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
              // System message
              if (message.messageType === "system") {
                return (
                  <div key={message._id} className="flex justify-center py-2">
                    <div className="rounded-full border border-slate-700 bg-slate-800/80 px-4 py-2 text-xs font-medium text-slate-400 backdrop-blur">
                      {message.content}
                    </div>
                  </div>
                );
              }

              const isMe = message.sender?._id === user?._id;

              return (
                <div
                  key={message._id}
                  className={`mb-4 flex ${isMe ? "justify-end" : "justify-start"
                    }`}
                >
                  <div
                    className={`flex max-w-[75%] min-w-0 items-end gap-2 ${isMe ? "flex-row-reverse" : ""
                      }`}
                  >
                    <img
                      src={message.sender?.avatar?.url}
                      alt={message.sender?.username}
                      className="h-11 w-11 rounded-full border border-slate-700 object-cover"
                    />

                    <div
                      className={`min-w-0 max-w-full rounded-2xl px-4 py-3 shadow-md ${isMe
                        ? "rounded-br-md bg-cyan-500 text-white"
                        : "rounded-bl-md border border-slate-700 bg-slate-800 text-slate-100"
                        }`}
                    >
                      {!isMe && (
                        <p className="mb-1 text-xs font-semibold text-cyan-400">
                          {message.sender?.username}
                        </p>
                      )}

                      <p className="whitespace-pre-wrap break-all text-sm leading-6">
                        {message.content}
                      </p>

                      <div
                        className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${isMe ? "text-white/80" : "text-slate-400"
                          }`}
                      >
                        <span>{formatDateTime(message.createdAt)}</span>

                        {isMe && <span className="font-bold">✓✓</span>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-slate-800 p-4">
        <form className="flex items-center gap-3" onSubmit={sendMessage}>
          <input
            type="text"
            ref={messagesRef}
            value={msg}
            disabled={sending}
            onChange={(e) => setMsg(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-full bg-slate-800 px-5 py-3 text-white outline-none placeholder:text-gray-400 disabled:opacity-60"
          />

          <button
            type="submit"
            disabled={sending}
            className="relative cursor-pointer flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 transition hover:bg-cyan-600"
          >
            {sending ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            ) : (
              <FiSend size={20} className="text-white" />
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
