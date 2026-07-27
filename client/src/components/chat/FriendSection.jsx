import React from "react";
import {
  FiArrowLeft,
  FiCheck,
  FiClock,
  FiUserPlus,
  FiX,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import useIsMobile from "../../hooks/useIsMobile";

export default function FriendSection() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const incomingRequests = [
    {
      id: 1,
      username: "Aman Sharma",
      department: "Computer Science",
      avatar: "https://i.pravatar.cc/150?img=12",
      mutual: 8,
    },
    {
      id: 2,
      username: "Sneha Das",
      department: "ECE",
      avatar: "https://i.pravatar.cc/150?img=32",
      mutual: 3,
    },
  ];

  const sentRequests = [
    {
      id: 3,
      username: "Rahul Singh",
      department: "Mechanical",
      avatar: "https://i.pravatar.cc/150?img=20",
      sentAt: "2 hours ago",
    },
    {
      id: 4,
      username: "Riya Roy",
      department: "IT",
      avatar: "https://i.pravatar.cc/150?img=45",
      sentAt: "Yesterday",
    },
  ];

  return (
    <div className="flex h-full flex-col rounded-2xl bg-slate-900">
      {/* Header */}
      <div className="border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-3">
          {isMobile && (
            <button
              onClick={() => navigate("/home/add-friend")}
              className="text-white"
            >
              <FiArrowLeft size={22} />
            </button>
          )}

          <div>
            <h2 className="text-xl font-semibold text-white">
              Friend Requests
            </h2>

            <p className="text-sm text-slate-400">
              Manage incoming and pending requests.
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-8 overflow-y-auto p-5 all-scroll">
        {/* Incoming */}
        <section>
          <div className="mb-4 flex items-center">
            <FiUserPlus className="mr-2 text-cyan-400" />

            <h3 className="text-lg font-semibold text-white">
              Incoming Requests
            </h3>

            <span className="ml-auto rounded-full bg-cyan-500/20 px-2.5 py-1 text-xs text-cyan-400">
              {incomingRequests.length}
            </span>
          </div>

          {incomingRequests.length === 0 ? (
            <div className="rounded-xl border border-slate-800 p-6 text-center text-slate-400">
              No incoming friend requests.
            </div>
          ) : (
            <div className="space-y-4">
              {incomingRequests.map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl border border-slate-800 bg-slate-800 p-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-14 w-14 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium text-white">
                        {user.username}
                      </h4>

                      <p className="text-sm text-slate-400">
                        {user.department}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {user.mutual} mutual connections
                      </p>

                      <div className="mt-4 flex gap-2">
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-cyan-500 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-600">
                          <FiCheck />
                          Accept
                        </button>

                        <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 hover:bg-slate-700">
                          <FiX />
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pending */}
        <section>
          <div className="mb-4 flex items-center">
            <FiClock className="mr-2 text-yellow-400" />

            <h3 className="text-lg font-semibold text-white">
              Pending Requests
            </h3>

            <span className="ml-auto rounded-full bg-yellow-500/20 px-2.5 py-1 text-xs text-yellow-400">
              {sentRequests.length}
            </span>
          </div>

          {sentRequests.length === 0 ? (
            <div className="rounded-xl border border-slate-800 p-6 text-center text-slate-400">
              No pending requests.
            </div>
          ) : (
            <div className="space-y-4">
              {sentRequests.map((user) => (
                <div
                  key={user.id}
                  className="rounded-xl border border-slate-800 bg-slate-800 p-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={user.avatar}
                      alt={user.username}
                      className="h-14 w-14 rounded-full object-cover"
                    />

                    <div className="min-w-0 flex-1">
                      <h4 className="truncate font-medium text-white">
                        {user.username}
                      </h4>

                      <p className="text-sm text-slate-400">
                        {user.department}
                      </p>

                      <p className="mt-1 text-xs text-yellow-400">
                        Request sent {user.sentAt}
                      </p>

                      <button className="mt-4 w-full rounded-lg border border-red-500/30 px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-500/10">
                        Cancel Request
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}