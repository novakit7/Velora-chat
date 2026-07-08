import React, { useEffect, useState } from "react";
import {
  FiSearch,
  FiMessageCircle,
} from "react-icons/fi";
import { notify } from "../../utils/toast";
import Loader from "../common/Loader";
import api from "../../api/axois";
import { useNavigate } from "react-router-dom";

export default function NewChat({ onSelectChat, setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const getFriends = async () => {
      try {
        setLoading(true);
        const res = await api.get("/friend-request/friends");
        setUsers(res.data.data)
      } catch (error) {
        console.error(error);
        notify.error(error?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };
    getFriends();
  }, []);


  const createChat = async (id) => {
    try {
      setLoading(true);
      const res = await api.post(`/chat/create-chat/${id}`)
      notify.success(res.data?.message);
      setActiveTab("Chats");
      onSelectChat(res.data.data);

    } catch (error) {
      console.error(error);
      notify.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-full rounded-2xl bg-slate-900 flex flex-col">

      {/* Header */}
      <div className="border-b border-slate-800 p-4">

        <h2 className="text-xl font-semibold text-white">
          New Chat
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Search users and start a conversation.
        </p>

        <div className="mt-4 flex items-center rounded-xl bg-slate-800 px-3 py-2">
          <FiSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Search username..."
            className="ml-2 flex-1 bg-transparent text-white outline-none placeholder:text-gray-400"
          />
        </div>

      </div>
      {loading && <div className="relative flex h-full items-center justify-center">
        <Loader variant="section" />
      </div>}
      {/* Users */}
      <div className="flex-1 overflow-y-auto">

        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between border-b border-slate-800 px-4 py-4 hover:bg-slate-800 transition"
          >

            <div className="flex items-center gap-3">

              <div className="relative">
                {user.avatar?.url ? (
                  <img
                    src={user.avatar.url}
                    alt={user.username}
                    className="h-12 w-12 rounded-full object-cover border-2 border-slate-700"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 font-semibold text-white">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}

                {user.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500" />
                )}
              </div>

              <div>

                <h3 className="font-medium text-white">
                  {user.username}
                </h3>

                <p className="text-sm text-gray-400">
                  {user.fullName}
                </p>

              </div>

            </div>

            <button
              onClick={() => createChat(user._id)}
              className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-600">

              <FiMessageCircle />

              Chat

            </button>

          </div>
        ))}

      </div>

    </div>
  );
}