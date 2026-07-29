import React, { useEffect, useState } from "react";
import { FiMessageCircle, FiSearch, FiTrash2 } from "react-icons/fi";
import { notify } from "../../utils/toast";
import Loader from "../common/Loader";
import api from "../../api/axois";
import { useNavigate } from "react-router-dom";

export default function NewChat() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const [removeLoadingId, setRemoveLoadingId] = useState(null);

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
      setChatLoadingId(id);

      const res = await api.post(`/chat/create-chat/${id}`);

      notify.success(res.data.message);

      navigate(`/home/chat/${res.data.data._id}`);
    } catch (error) {
      console.error(error);

      notify.error(
        error?.response?.data?.message ||
        "Something went wrong"
      );
    } finally {
      setChatLoadingId(null);
    }
  };

  const removeFriend = async (friendId) => {
    try {
      setRemoveLoadingId(friendId);

      await api.delete(`/friend-request/remove/${friendId}`);

      setUsers((prev) =>
        prev.filter((user) => user._id !== friendId)
      );

      notify.success("Friend removed successfully");
    } catch (error) {
      console.error(error);

      notify.error(
        error?.response?.data?.message ||
        "Failed to remove friend"
      );
    } finally {
      setRemoveLoadingId(null);
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
      <div className="flex-1 overflow-y-auto all-scroll p-4">
        {users.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-slate-400">
            <FiMessageCircle size={40} className="mb-3 opacity-40" />
            <p>No friends found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {users.map((user) => (
              <div
                key={user._id}
                className="rounded-xl border border-slate-800 bg-slate-800 p-4 transition hover:border-cyan-500/40"
              >
                <div className="flex items-center gap-4">
                  <div className="relative">
                    {user.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.username}
                        className="h-14 w-14 rounded-full object-cover ring-2 ring-slate-700"
                      />
                    ) : (
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-cyan-500 text-lg font-semibold text-white">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {user.online && (
                      <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-slate-900 bg-green-500" />
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-white">
                      {user.username}
                    </h3>

                    <p className="truncate text-sm text-slate-400">
                      {user.fullName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => createChat(user._id)}
                    disabled={chatLoadingId === user._id}
                    className="flex items-center justify-center gap-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:opacity-60"
                  >
                    {chatLoadingId === user._id ? (
                      <Loader variant="button" />
                    ) : (
                      <>
                        <FiMessageCircle />
                        Chat
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => removeFriend(user._id)}
                    disabled={removeLoadingId === user._id}
                    className="flex items-center justify-center gap-2 rounded-lg border border-red-500/30 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 disabled:opacity-60"
                  >
                    {removeLoadingId === user._id ? (
                      <Loader variant="button" />
                    ) : (
                      <>
                        <FiTrash2 />
                        Remove
                      </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}