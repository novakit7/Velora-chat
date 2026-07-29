import React, { useState, useEffect } from "react";
import { FiSearch, FiUserPlus, FiCheck, FiX } from "react-icons/fi";
import api from "../../api/axois";
import { notify } from "../../utils/toast";
import Loader from "../common/Loader";
import { FiUsers } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile";

export default function AddFriend() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const searchUsers = async (searchQuery = "") => {
    try {
      setLoading(true);
      const res = await api.get(`/search/user?query=${searchQuery}`);
      setUsers(res.data.data);
    } catch (error) {
      console.log(error);
      notify.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    const timer = setTimeout(() => {
      searchUsers(query.trim());
    }, 700);

    return () => clearTimeout(timer);
  }, [query]);

  const sendRequest = async (userId) => {
    try {
      setSendingId(userId);
      const res = await api.post(`/friend-request/send/${userId}`);
      notify.success(res.data?.message);
      setUsers((prev) => prev.filter((user) => user._id !== userId));
    } catch (error) {
      console.log(error);
      notify.error(
        error?.response?.data?.message || "Something went wrong"
      );
    } finally {
      setSendingId(null);
    }
  };


  return (
    <div className="h-full rounded-2xl bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="border-b border-slate-800 p-4">
        <h2 className="text-xl font-semibold text-white">
          Add Friends
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          Search by username and send friend requests.
        </p>

        {/* Search */}
        <div className="mt-4 flex items-center rounded-xl bg-slate-800 px-3 py-2">
          <FiSearch className="text-gray-400" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="ml-2 flex-1 bg-transparent text-white outline-none placeholder:text-gray-400"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-700 hover:text-white"
            >
              <FiX size={17} />
            </button>
          )}
        </div>

        {/* Mobile Only */}
        {isMobile && (
          <button
            onClick={() => navigate("/home/friend-requests")}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-500 px-4 py-3 font-medium text-white transition hover:bg-cyan-600"
          >
            <FiUsers size={20} />
            Manage Requests
          </button>
        )}
      </div>

      {/* Users */}
      <div className="flex-1 overflow-y-auto all-scroll">
        {loading ? (
          <div className="relative flex h-full items-center justify-center">
            <Loader variant="section" />
          </div>
        ) : users.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">

            <div className="rounded-full bg-slate-800 p-6 shadow-lg">
              <FiUsers className="text-5xl text-slate-500" />
            </div>

            <h2 className="mt-6 text-xl font-semibold text-white">
              No Users Found
            </h2>

            <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
              {query
                ? `We couldn't find anyone matching "${query}".`
                : "Start typing a username to search for new friends."}
            </p>

            {query && (
              <button
                onClick={() => setQuery("")}
                className="mt-5 rounded-xl border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 transition hover:border-cyan-500 hover:text-cyan-400"
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="group flex items-center justify-between rounded-xl border border-transparent bg-slate-800 px-4 py-3.5 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800/80"
            >
              <div className="flex min-w-0 items-center gap-3">
                {/* Avatar */}
                <div className="shrink-0">
                  {user.avatar ? (
                    <img
                      src={user.avatar.url}
                      alt={user.username}
                      className="h-12 w-12 rounded-full border border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-sm font-semibold text-white">
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
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

              {/* Send Button */}
              <button
                onClick={() => sendRequest(user._id)}
                disabled={sendingId === user._id}
                className="ml-4 flex shrink-0 items-center justify-center gap-2 rounded-xl border border-cyan-500 bg-cyan-500 px-4 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:border-cyan-400 hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {sendingId === user._id ? (
                  <Loader variant="button" />
                ) : (
                  <>
                    <FiUserPlus className="text-base" />
                    Send
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}