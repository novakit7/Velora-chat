import React, { useState, useEffect, useRef } from "react";
import { notify } from "../../utils/toast";
import {
  FiArrowLeft,
  FiEdit2,
  FiMoreVertical,
  FiSend,
  FiTrash2,
} from "react-icons/fi";
import Loader from "../common/Loader";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { formatDateTime } from "../../utils/date";
import api from "../../api/axois";
import { useParams } from "react-router-dom";

export default function Conversation({ onBack }) {
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
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
      if (!loading && messages.length > 0) {
        setTimeout(() => {
          scrollToBottom("auto");
        }, 100);
      }
    }, [loading]);
  
    useEffect(() => {
      if (messages.length > 0) {
        scrollToBottom("smooth");
      }
    }, [messages]);
  

  useEffect(() => {
    const fetchChat = async () => {
      try {
        const res = await api.get(`/chat/${chatId}`);
        setChat(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (chatId) {
      fetchChat();
    }
  }, [chatId]);

  useEffect(() => {
    const getChats = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/chat/message/${chat?._id}?page=1&limit=10`);
        setMessages(res.data?.data?.messages);
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
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!msg.trim()) return;
    try {
      setLoading(true);
      const res = await api.post(`/message/${chat._id}/message`, {
        content: msg,
      });
      setMessages((prev) => [
        ...prev, res.data?.data
      ])
    } catch (error) {
      console.error(error);
      notify.error(error?.response?.data?.message || "Something went wrong while sending a message.");
    } finally {
      setMsg("")
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
            {messages.map((message) => {
              const isMe = message.sender._id === user._id;

              return (
                <div
                  key={message._id}
                  className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`flex items-end gap-2 max-w-[75%] ${isMe ? "flex-row-reverse" : ""
                      }`}
                  >
                    {/* Avatar */}
                    <img
                      src={message.sender?.avatar?.url}
                      alt={message.sender?.username}
                      className="h-10 w-10 rounded-full object-cover border border-slate-700"
                    />

                    {/* Bubble */}
                    <div
                      className={`px-4 py-3 max-w-md wrap-break-words rounded-2xl shadow ${isMe
                          ? "bg-cyan-500 text-white rounded-br-md"
                          : "bg-slate-800 text-slate-100 rounded-bl-md border border-slate-700"
                        }`}
                    >
                      {/* Username */}
                      {!isMe && (
                        <p className="mb-1 text-xs font-semibold text-cyan-400">
                          {message.sender?.username}
                        </p>
                      )}

                      {/* Message */}
                      <p className="text-sm leading-6">{message.content}</p>

                      {/* Time + Tick */}
                      <div
                        className={`mt-2 flex items-center justify-end gap-1 text-[11px] ${isMe ? "text-white/80" : "text-slate-400"
                          }`}
                      >
                        <span>{formatDateTime(message.createdAt)}</span>

                        {isMe && (
                          <span className="font-bold tracking-tight">✓✓</span>
                        )}
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
        <form className="flex items-center gap-3">
          <input
            type="text"
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
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
