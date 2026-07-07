import React from "react";
import {
  FiSearch,
  FiUserPlus,
  FiCheck,
} from "react-icons/fi";

const users = [
  {
    id: 1,
    username: "Ankit",
    bio: "Full Stack Developer",
    mutual: 8,
    online: true,
    requested: false,
  },
  {
    id: 2,
    username: "Rahul",
    bio: "React Developer",
    mutual: 5,
    online: false,
    requested: true,
  },
  {
    id: 3,
    username: "Priya",
    bio: "UI/UX Designer",
    mutual: 12,
    online: true,
    requested: false,
  },
  {
    id: 4,
    username: "Aman",
    bio: "Backend Engineer",
    mutual: 2,
    online: true,
    requested: false,
  },
];

export default function AddFriend() {
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
            placeholder="Search username..."
            className="ml-2 flex-1 bg-transparent text-white outline-none placeholder:text-gray-400"
          />
        </div>

      </div>

      {/* Suggestions */}

      <div className="flex-1 overflow-y-auto">

        {users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between border-b border-slate-800 px-4 py-4 hover:bg-slate-800 transition"
          >

            <div className="flex items-center gap-3">

              <div className="relative">

                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 text-lg font-semibold text-white">
                  {user.username[0]}
                </div>

                {user.online && (
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-slate-900 bg-green-500" />
                )}

              </div>

              <div>

                <h3 className="font-medium text-white">
                  {user.username}
                </h3>

                <p className="text-sm text-gray-400">
                  {user.bio}
                </p>

                <p className="text-xs text-gray-500 mt-1">
                  {user.mutual} Mutual Friends
                </p>

              </div>

            </div>

            {user.requested ? (
              <button
                disabled
                className="flex items-center gap-2 rounded-xl bg-slate-700 px-4 py-2 text-sm text-gray-300"
              >
                <FiCheck />
                Sent
              </button>
            ) : (
              <button
                className="flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-600"
              >
                <FiUserPlus />
                Add
              </button>
            )}

          </div>
        ))}

      </div>

    </div>
  );
}