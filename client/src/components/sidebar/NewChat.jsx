import React, { useEffect, useState } from "react";
import {
  FiMessageCircle,
  FiPlusSquare,
  FiSearch,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { notify } from "../../utils/toast";
import Loader from "../common/Loader";
import api from "../../api/axois";
import { useNavigate } from "react-router-dom";
import { useOnlineStatus } from "../../context/OnlineStatusContext";

export default function NewChat() {
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const [chatLoadingId, setChatLoadingId] = useState(null);
  const [removeLoadingId, setRemoveLoadingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [query, setQuery] = useState("");
  const { isUserOnline } = useOnlineStatus();

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

      await api.delete(`/friend-request/delete/${friendId}`);

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

  const filteredUsers = users.filter((user) => {
    const search = query.toLowerCase();

    return (
      user.username?.toLowerCase().includes(search) ||
      user.fullName?.toLowerCase().includes(search) ||
      user.email?.toLowerCase().includes(search)
    );
  });

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

        <div className="mt-4 flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 transition-all duration-200 focus-within:border-cyan-500">
          <FiSearch className="text-slate-400" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="text"
            placeholder="Search friends..."
            className="ml-3 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded-full p-1 cursor-pointer text-slate-400 transition hover:bg-slate-700 hover:text-white"
            >
              <FiX size={17} />
            </button>
          )}
        </div>

      </div>
      {loading && <div className="relative flex h-full items-center justify-center">
        <Loader variant="section" />
      </div>}
      {/* Users */}
      <div className="flex-1 overflow-y-auto all-scroll p-4 ">
        {filteredUsers.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="rounded-full bg-slate-800 p-5">
              <FiMessageCircle
                size={42}
                className="text-slate-500"
              />
            </div>

            <h3 className="mt-5 text-lg font-semibold text-white">
              No Friends Yet
            </h3>

            <p className="mt-2 max-w-xs text-sm text-slate-400">
              Once you add friends, they'll appear here so you can start chatting instantly.
            </p>
            <button
              onClick={() => navigate("/home/add-friend")}
              className="mt-6 flex items-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 px-6 py-3 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/30"
            >
              <FiPlusSquare />
              Add Friend
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredUsers.map((user) => (
              <div
                key={user._id}
                className="group rounded-xl border border-transparent bg-slate-800 px-4 py-3.5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative shrink-0">
                    {user.avatar?.url ? (
                      <img
                        src={user.avatar.url}
                        alt={user.username}
                        className="h-12 w-12 rounded-full object-cover border border-slate-700"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-sm font-semibold text-white">
                        {user.username?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span
                      className={`absolute bottom-0.5 right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${isUserOnline(user?._id) ? "bg-emerald-500" : "bg-slate-500"
                        }`}
                    />
                  </div>

                  {/* User Details */}
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {user.username}
                    </h3>

                    <p className="truncate text-xs text-slate-400">
                      {user.fullName}
                    </p>

                    <p className="truncate text-xs text-slate-500">
                      {user.email}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => createChat(user._id)}
                    disabled={chatLoadingId === user._id}
                    className="flex items-center justify-center cursor-pointer gap-2 rounded-xl border border-cyan-500 bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:bg-cyan-600 hover:border-cyan-400 disabled:opacity-60"
                  >
                    {chatLoadingId === user._id ? (
                      <Loader variant="button" />
                    ) : (
                      <>
                        <FiMessageCircle className="text-base" />
                        Chat
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setConfirmDelete(user)}
                    disabled={removeLoadingId === user._id}
                    className="flex items-center cursor-pointer justify-center gap-2 rounded-xl border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-400 transition-all duration-200 hover:border-red-500/60 hover:bg-red-500/10 disabled:opacity-60"
                  >
                    {removeLoadingId === user._id ? (
                      <Loader variant="button" />
                    ) : (
                      <>
                        <FiTrash2 className="text-base" />
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
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-[90%] max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl animate-[fadeIn_.2s_ease]">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-500/15">
              <FiTrash2 className="text-3xl text-red-400" />
            </div>

            <h2 className="mt-5 text-center text-xl font-semibold text-white">
              Remove Friend?
            </h2>

            <p className="mt-3 text-center text-sm text-slate-400">
              Are you sure you want to remove{" "}
              <span className="font-semibold text-white">
                {confirmDelete.username}
              </span>
              ?
              <br />
              You'll need to send a friend request again to chat in the future.
            </p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 rounded-xl border cursor-pointer border-slate-700 py-3 font-medium text-slate-300 transition hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                onClick={async () => {
                  await removeFriend(confirmDelete._id);
                  setConfirmDelete(null);
                }}
                disabled={removeLoadingId === confirmDelete._id}
                className="flex flex-1 items-center cursor-pointer justify-center rounded-xl bg-red-500 py-3 font-medium text-white transition hover:bg-red-600 disabled:opacity-60"
              >
                {removeLoadingId === confirmDelete._id ? (
                  <Loader variant="button" />
                ) : (
                  "Remove"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}