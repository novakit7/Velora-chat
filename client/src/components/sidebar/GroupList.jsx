import React, { useEffect, useState } from "react";
import { FiSearch, FiX, FiUser, FiCheck, FiPlus } from "react-icons/fi";
import api from "../../api/axois";
import Loader from "../common/Loader";
import { notify } from "../../utils/toast";
import { formatRelativeDate } from "../../utils/date";
import { useNavigate, useParams } from "react-router-dom";

export default function GroupList() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const navigate = useNavigate();
  const { chatId } = useParams();
  const [query, setQuery] = useState("");

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

  const handleCreateGroup = () => {
    if (!newGroupName.trim()) return notify.error("Group name cannot be empty");

    const newGroup = {
      _id: Date.now().toString(),
      groupName: newGroupName,
      isGroupChat: true,
      participantsCount: 1,
      createdAt: new Date().toISOString(),
      latestMessage: {
        content: "Group created",
        createdAt: new Date().toISOString(),
        sender: { fullName: "You" },
      },
    };

    setGroups([newGroup, ...groups]);
    setNewGroupName("");
    setShowCreateModal(false);
    notify.success("Group created successfully!");
    onSelectChat(newGroup);
  };

  const dummyFriends = [
    { id: "1", name: "Alex Johnson" },
    { id: "2", name: "Sam Smith" },
    { id: "3", name: "Taylor Swift" },
    { id: "4", name: "Jordan Lee" },
    { id: "5", name: "Casey Kim" },
  ];

  const toggleFriendSelection = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId],
    );
  };

  return (
    <div className="h-full bg-slate-900 rounded-2xl flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Groups</h2>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500 text-white transition-all duration-200 hover:bg-cyan-600"
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
              className="rounded-full p-1 text-slate-400 transition hover:bg-slate-700 hover:text-white"
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
              className="rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600"
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
                  className={`group flex w-full items-center justify-between rounded-xl border px-4 py-4 transition-all duration-200
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
      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-full max-w-md rounded-2xl bg-slate-800 p-6 max-h-[80vh] overflow-y-auto all-scroll">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-white">
                Create New Group
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="mt-4 flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 transition-all focus-within:border-cyan-500">
                <FiSearch className="text-slate-400" />
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="ml-3 flex-1 bg-transparent text-sm text-white placeholder:text-slate-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">
                  Select Friends ({selectedFriends.length} selected)
                </label>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {dummyFriends.map((friend) => (
                    <div
                      key={friend.id}
                      onClick={() => toggleFriendSelection(friend.id)}
                      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${selectedFriends.includes(friend.id) ? "bg-slate-700" : "hover:bg-slate-700"}`}
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-600">
                        <FiUser className="text-gray-300" />
                      </div>
                      <div className="flex-1 text-white">{friend.name}</div>
                      {selectedFriends.includes(friend.id) && (
                        <div className="text-cyan-500">
                          <FiCheck />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateGroup}
                disabled={!newGroupName.trim() || selectedFriends.length === 0}
                className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-white hover:bg-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
