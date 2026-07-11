import React, { useState, useEffect } from "react";
import { FiSearch, FiUserPlus, FiCheck } from "react-icons/fi";
import api from "../../api/axois";
import { notify } from "../../utils/toast";
import Loader from "../common/Loader";

export default function AddFriend() {
  const [users, setUsers] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

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

        <div className="mt-4 flex items-center rounded-xl bg-slate-800 px-3 py-2">
          <FiSearch className="text-gray-400" />

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search users..."
            className="ml-2 flex-1 bg-transparent text-white outline-none placeholder:text-gray-400"
          />
        </div>
      </div>
      {/* Users */}
      <div className="flex-1 overflow-y-auto all-scroll">
        {loading &&
          <div className="relative flex h-full items-center justify-center">
            <Loader variant="section" />
          </div>}
        {users.length === 0 ? (
          <div className="flex h-full items-center justify-center text-gray-400">
            No users found
          </div>
        ) : (
          users.map((user) => (
            <div
              key={user._id}
              className="flex items-center justify-between border-b border-slate-800 px-4 py-4 hover:bg-slate-800 transition"
            >
              <div className="flex items-center gap-3">
                {user.avatar ? (
                  <img
                    src={user.avatar.url}
                    alt={user.username}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-lg font-semibold text-white">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                )}

                <div>
                  <h3 className="font-medium text-white">
                    {user.username}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {user.fullName}
                  </p>

                  <p className="text-xs text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              <button className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-600">
                <FiUserPlus />
                Add
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}