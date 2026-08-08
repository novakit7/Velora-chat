import React, { useEffect, useState } from "react";
import { FiSearch, FiX, FiPlus } from "react-icons/fi";
import api from "../../api/axois";
import Loader from "../common/Loader";
import { notify } from "../../utils/toast";
import { formatRelativeDate } from "../../utils/date";
import { useNavigate, useParams } from "react-router-dom";
import CreateGroupModel from "../models/CreateGroupModel";

export default function GroupList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const { chatId } = useParams();

  useEffect(() => {
    const getGroups = async () => {
      try {
        setLoading(true);

        const res = await api.get("/chat");

        const data = res.data.data.filter((chat) => chat.isGroupChat);

        setGroups(data);
      } catch (error) {
        console.error(error);
        notify.error(error?.response?.data?.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    };

    getGroups();
  }, []);

  const filteredGroups = groups.filter((group) =>
    group.groupName.toLowerCase().includes(query.toLowerCase()),
  );


  return (
    <div className="h-full bg-slate-900 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Groups</h2>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex h-10 w-10 items-center cursor-pointer justify-center rounded-xl bg-cyan-500 text-white transition-all duration-200 hover:bg-cyan-600"
            title="Create Group"
          >
            <FiPlus size={18} />
          </button>
        </div>

        <div className="mt-4 flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 transition-all duration-200 focus-within:border-cyan-500">
          <FiSearch className="text-slate-400" />

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search groups..."
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

      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="relative flex h-full items-center justify-center">
            <Loader variant="section" />
          </div>
        ) : filteredGroups.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-4">
            <h3 className="text-lg font-semibold text-white">No groups yet</h3>

            <p className="text-center text-gray-400">
              Create a group and start chatting.
            </p>

            <button
              onClick={() => setShowCreateModal(true)}
              className="rounded-lg cursor-pointer bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600"
            >
              Create Group
            </button>
          </div>
        ) : (
          <>
            {filteredGroups.map((group) => {
              const avatar = group.groupAvatar?.url;
              const message = group.latestMessage?.content || "No messages yet";

              return (
                <button
                  key={group._id}
                  onClick={() => navigate(`/home/group/${group._id}`)}
                  className={`group flex cursor-pointer w-full items-center justify-between rounded-xl border px-4 py-4 transition-all duration-200
  ${chatId === group._id
                      ? "border-cyan-500 bg-slate-800 shadow-md"
                      : "border-transparent hover:border-slate-700 hover:bg-slate-800/60"
                    }`}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="relative shrink-0">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={group.groupName}
                          className="h-11 w-11 rounded-full border border-slate-700 object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-cyan-500 text-sm font-semibold text-white">
                          {group.groupName?.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full border border-slate-900 bg-cyan-500 text-[10px] font-medium text-white">
                        {group.participantsCount}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1 text-left">
                      <h3 className="truncate text-sm font-semibold text-white">
                        {group.groupName}
                      </h3>

                      <p className="truncate text-xs text-slate-400">
                        <span className="font-medium text-slate-300">
                          {group.latestMessage?.sender?.fullName}:
                        </span>{" "}
                        {message}
                      </p>
                    </div>
                  </div>

                  <span className="ml-3 shrink-0 text-[11px] text-slate-500">
                    {formatRelativeDate(group.latestMessage?.createdAt)}
                  </span>
                </button>
              );
            })}
          </>
        )}
      </div>
      {showCreateModal && (
        <CreateGroupModel
          onClose={() => setShowCreateModal(false)}
          onCreate={(groupData) => {
            console.log("Dummy group:", groupData);

            setShowCreateModal(false);

            notify.success("Group created successfully!");
          }}
        />
      )}

    </div>
  );
}
