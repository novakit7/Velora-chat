import React from "react";
import { FiSearch, FiUsers } from "react-icons/fi";

const groups = [
  {
    id: 1,
    name: "React Developers",
    message: "Ankit: Push your latest changes 🚀",
    time: "10:30",
    unread: 5,
    members: 24,
  },
  {
    id: 2,
    name: "College Friends",
    message: "Rahul: Party this weekend? 🎉",
    time: "09:10",
    unread: 2,
    members: 12,
  },
  {
    id: 3,
    name: "Office Team",
    message: "Priya: Meeting starts in 15 mins",
    time: "Yesterday",
    unread: 0,
    members: 18,
  },
  {
    id: 4,
    name: "Gaming Squad",
    message: "Aman: Ready for tonight? 🎮",
    time: "Yesterday",
    unread: 1,
    members: 8,
  },
];

export default function GroupList({
  selectedChat,
  onSelectChat,
}) {
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
            className="ml-2 flex-1 bg-transparent text-white outline-none placeholder:text-gray-400"
          />
        </div>

      </div>

      {/* Groups */}
      <div className="flex-1 overflow-y-auto">

        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => onSelectChat?.(group)}
            className={`w-full flex items-center justify-between px-4 py-3 transition hover:bg-slate-800 ${
              selectedChat?.id === group.id
                ? "bg-slate-800"
                : ""
            }`}
          >

            <div className="flex items-center gap-3">

              {/* Group Avatar */}
              <div className="relative">

                <div className="w-12 h-12 rounded-full bg-violet-600 flex items-center justify-center">
                  <FiUsers className="text-white text-xl" />
                </div>

                <span className="absolute -bottom-1 -right-1 rounded-full bg-slate-900 px-1 text-[10px] text-gray-300">
                  {group.members}
                </span>

              </div>

              {/* Group Details */}
              <div className="text-left">

                <h3 className="font-medium text-white">
                  {group.name}
                </h3>

                <p className="max-w-44 truncate text-sm text-gray-400">
                  {group.message}
                </p>

              </div>

            </div>

            <div className="flex flex-col items-end">

              <span className="text-xs text-gray-400">
                {group.time}
              </span>

              {group.unread > 0 && (
                <span className="mt-2 flex h-5 w-5 items-center justify-center rounded-full bg-violet-500 text-xs text-white">
                  {group.unread}
                </span>
              )}

            </div>

          </button>
        ))}

      </div>
    </div>
  );
}