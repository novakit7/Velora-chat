import React, { useEffect, useState } from "react";
import { FiSearch } from "react-icons/fi";
import api from "../../api/axois";
import Loader from "../common/Loader";
import { notify } from "../../utils/toast";
import { formatRelativeDate } from "../../utils/date";

export default function GroupList({ onSelectChat, selectedChat }) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getGroups = async () => {
      try {
        setLoading(true);

        const res = await api.get("/chat");

        const data = res.data.data.filter(
          (chat) => chat.isGroupChat
        );

        setGroups(data);
      } catch (error) {
        console.error(error);
        notify.error(
          error?.response?.data?.message || "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    getGroups();
  }, []);

  return (
    <div className="h-full bg-slate-900 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900 p-4 border-b border-slate-800">
        <h2 className="text-xl font-semibold text-white">
          Groups
        </h2>

        <div className="mt-4 flex items-center rounded-xl bg-slate-800 px-3 py-2">
          <FiSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Search groups..."
            className="ml-2 flex-1 bg-transparent outline-none text-white placeholder:text-gray-400"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="relative flex h-full items-center justify-center">
            <Loader variant="section" />
          </div>
        ) : groups.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <h3 className="text-lg font-semibold text-white">
              No groups yet
            </h3>

            <p className="text-center text-gray-400">
              Create a group and start chatting.
            </p>

            <button className="rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600">
              Create Group
            </button>
          </div>
        ) : (
          groups.map((group) => {
            const avatar = group.groupAvatar?.url;
            const message =
              group.latestMessage?.content || "No messages yet";

            return (
              <button
                key={group._id}
                onClick={() => onSelectChat(group)}
                className={`w-full flex items-center justify-between px-4 py-3 transition hover:bg-slate-800 ${
                  selectedChat?._id === group._id
                    ? "bg-slate-800"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={group.groupName}
                        className="h-12 w-12 rounded-full object-cover border-2 border-slate-700"
                      />
                    ) : (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 font-semibold text-white">
                        {group.groupName?.charAt(0).toUpperCase()}
                      </div>
                    )}

                    <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-cyan-500 text-[10px] text-white">
                      {group.participantsCount}
                    </span>
                  </div>

                  {/* Details */}
                  <div className="text-left">
                    <h3 className="font-medium text-white">
                      {group.groupName}
                    </h3>

                    <p className="max-w-44 truncate text-sm text-gray-400">
                      <span className="font-medium">
                        {group.latestMessage?.sender?.fullName}:
                      </span>{" "}
                      {message}
                    </p>
                  </div>
                </div>

                <span className="text-xs text-gray-400">
                  {formatRelativeDate(
                    group.latestMessage?.createdAt
                  )}
                </span>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}