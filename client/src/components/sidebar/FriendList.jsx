import React from "react";
import {
  FiSearch,
  FiMessageCircle,
  FiUser,
} from "react-icons/fi";

const friends = [
  {
    id: 1,
    username: "Ankit",
    bio: "Full Stack Developer",
    online: true,
  },
  {
    id: 2,
    username: "Rahul",
    bio: "React Developer",
    online: false,
  },
  {
    id: 3,
    username: "Priya",
    bio: "UI/UX Designer",
    online: true,
  },
  {
    id: 4,
    username: "Aman",
    bio: "Backend Engineer",
    online: true,
  },
  {
    id: 5,
    username: "Neha",
    bio: "Machine Learning Enthusiast",
    online: false,
  },
];

export default function FriendList() {
  return (
    <div className="h-full bg-slate-900 rounded-2xl flex flex-col">

      {/* Header */}
      <div className="border-b border-slate-800 p-4">

        <h2 className="text-xl font-semibold text-white">
          Friends
        </h2>

        <p className="mt-1 text-sm text-gray-400">
          {friends.length} Friends
        </p>

        <div className="mt-4 flex items-center rounded-xl bg-slate-800 px-3 py-2">
          <FiSearch className="text-gray-400" />

          <input
            type="text"
            placeholder="Search friends..."
            className="ml-2 flex-1 bg-transparent text-white outline-none placeholder:text-gray-400"
          />
        </div>

      </div>

      {/* Friends */}
      <div className="flex-1 overflow-y-auto">

        {friends.map((friend) => (
          <div
            key={friend.id}
            className="flex items-center justify-between border-b border-slate-800 px-4 py-4 hover:bg-slate-800 transition"
          >

            <div className="flex items-center gap-3">

              <div className="relative">

                <div className="h-12 w-12 rounded-full bg-cyan-500 flex items-center justify-center text-white font-semibold text-lg">
                  {friend.username[0]}
                </div>

                {friend.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500" />
                )}

              </div>

              <div>

                <h3 className="font-medium text-white">
                  {friend.username}
                </h3>

                <p className="text-sm text-gray-400">
                  {friend.bio}
                </p>

                <span
                  className={`text-xs ${
                    friend.online
                      ? "text-green-400"
                      : "text-gray-500"
                  }`}
                >
                  {friend.online ? "Online" : "Offline"}
                </span>

              </div>

            </div>

            <div className="flex gap-2">

              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-white transition hover:bg-cyan-600"
                title="Chat"
              >
                <FiMessageCircle />
              </button>

              <button
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-700 text-gray-300 transition hover:bg-slate-600"
                title="Profile"
              >
                <FiUser />
              </button>

            </div>

          </div>
        ))}

      </div>
    </div>
  );
}