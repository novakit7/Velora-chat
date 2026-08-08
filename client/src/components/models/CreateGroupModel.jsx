import React, { useState, useEffect } from "react";
import Loader from "../common/Loader";
import {
    FiSearch,
    FiX,
    FiUser,
    FiCheck,
    FiImage,
} from "react-icons/fi";

import api from "../../api/axois";
import { notify } from "../../utils/toast";

export default function CreateGroupModel({ onClose, onCreate }) {
    const [groupName, setGroupName] = useState("");
    const [description, setDescription] = useState("");
    const [search, setSearch] = useState("");
    const [selectedFriends, setSelectedFriends] = useState([]);

    const [friends, setFriends] = useState([]);
    const [loading, setLoading] = useState(false);
    const [groupAvatar, setGroupAvatar] = useState(null);

    useEffect(() => {
        const getFriends = async () => {
            try {
                setLoading(true);

                const res = await api.get("/friend-request/friends");

                setFriends(res.data.data || []);
            } catch (error) {
                console.error(error);

                notify.error(
                    error?.response?.data?.message ||
                    "Failed to load friends",
                );
            } finally {
                setLoading(false);
            }
        };

        getFriends();
    }, []);

    const filteredFriends = friends.filter((friend) => {
        const name = (
            friend.fullName ||
            friend.name ||
            ""
        ).toLowerCase();

        const username = (
            friend.username || ""
        ).toLowerCase();

        const searchValue = search.toLowerCase();

        return (
            name.includes(searchValue) ||
            username.includes(searchValue)
        );
    });


    const toggleFriend = (friendId) => {
        setSelectedFriends((prev) =>
            prev.includes(friendId)
                ? prev.filter((id) => id !== friendId)
                : [...prev, friendId],
        );
    };

    const handleCreate = () => {
        if (!groupName.trim()) {
            return notify.error("Group name is required");
        }

        if (selectedFriends.length < 2) {
            return notify.error(
                "Select at least 2 friends to create a group.",
            );
        }

        const groupData = {
            groupName: groupName.trim(),
            description: description.trim(),
            participants: selectedFriends,
        };

        onCreate?.(groupData);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-6"
            onClick={onClose}
        >
            <div
                className="flex w-full max-w-md flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
                style={{ maxHeight: "85vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="shrink-0 border-b border-slate-800 px-5 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold text-white">
                                Create Group
                            </h2>

                            <p className="mt-1 text-xs text-slate-400">
                                Create a group and start chatting
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 all-scroll">
                    <div className="space-y-5">
                        {/* Group Avatar */}
                        <div className="flex justify-center">
                            <label
                                htmlFor="group-avatar"
                                className="group relative flex h-20 w-20 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-slate-600 bg-slate-800 transition hover:border-cyan-500"
                            >
                                {groupAvatar ? (
                                    <img
                                        src={URL.createObjectURL(groupAvatar)}
                                        alt="Group avatar preview"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <FiImage
                                        size={24}
                                        className="text-slate-400 transition group-hover:text-cyan-400"
                                    />
                                )}

                                {/* Hover overlay */}
                                <div className="absolute inset-0 flex items-end justify-center bg-black/40 pb-1 opacity-0 transition group-hover:opacity-100">
                                    <span className="text-[9px] text-white">
                                        {groupAvatar ? "Change photo" : "Add photo"}
                                    </span>
                                </div>
                            </label>

                            <input
                                id="group-avatar"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];

                                    if (!file) return;

                                    setGroupAvatar(file);
                                }}
                            />
                        </div>

                        {/* Group Name */}
                        <div>
                            <label className="mb-2 block text-sm font-medium text-slate-300">
                                Group name
                            </label>

                            <input
                                type="text"
                                value={groupName}
                                onChange={(e) => setGroupName(e.target.value)}
                                placeholder="Enter group name"
                                maxLength={100}
                                className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">
                                    Description
                                </label>

                                <span className="text-[11px] text-slate-500">
                                    Optional
                                </span>
                            </div>

                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What's this group about?"
                                maxLength={500}
                                rows={3}
                                className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
                            />

                            <div className="mt-1 text-right text-[10px] text-slate-500">
                                {description.length}/500
                            </div>
                        </div>

                        {/* Friends */}
                        <div>
                            <div className="mb-2 flex items-center justify-between">
                                <label className="text-sm font-medium text-slate-300">
                                    Add friends
                                </label>

                                <span className="text-xs text-cyan-400">
                                    {selectedFriends.length} selected
                                </span>
                            </div>

                            {/* Search */}
                            <div className="flex items-center rounded-xl border border-slate-700 bg-slate-800 px-3 py-3 transition focus-within:border-cyan-500">
                                <FiSearch className="shrink-0 text-slate-400" />

                                <input
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Search friends..."
                                    className="ml-3 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                                />

                                {search && (
                                    <button
                                        type="button"
                                        onClick={() => setSearch("")}
                                        className="cursor-pointer text-slate-500 hover:text-white"
                                    >
                                        <FiX size={16} />
                                    </button>
                                )}
                            </div>

                            {/* Friend List */}
                            <div className="mt-3 max-h-52 space-y-1 overflow-y-auto">
                                {loading ? (
                                    <div className="flex h-32 items-center justify-center">
                                        <Loader variant="button" />
                                    </div>
                                ) : filteredFriends.length === 0 ? (
                                    <div className="py-8 text-center text-sm text-slate-500">
                                        {search
                                            ? "No friends found"
                                            : "You don't have any friends yet"}
                                    </div>
                                ) : (
                                    filteredFriends.map((friend) => {
                                        const friendId = friend._id || friend.id;

                                        const name =
                                            friend.fullName ||
                                            friend.name ||
                                            friend.username ||
                                            "Unknown user";

                                        const selected =
                                            selectedFriends.includes(friendId);

                                        return (
                                            <button
                                                type="button"
                                                key={friendId}
                                                onClick={() => toggleFriend(friendId)}
                                                className={`flex w-full cursor-pointer items-center gap-3 rounded-xl p-3 text-left transition ${selected
                                                    ? "bg-cyan-500/10 ring-1 ring-cyan-500/40"
                                                    : "hover:bg-slate-800"
                                                    }`}
                                            >
                                                {/* Avatar */}
                                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-700">
                                                    {friend.avatar ? (
                                                        <img
                                                            src={
                                                                typeof friend.avatar === "string"
                                                                    ? friend.avatar
                                                                    : friend.avatar.url
                                                            }
                                                            alt={name}
                                                            className="h-full w-full object-cover"
                                                        />
                                                    ) : (
                                                        <FiUser className="text-slate-400" />
                                                    )}
                                                </div>

                                                {/* User Info */}
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate text-sm font-medium text-white">
                                                        {name}
                                                    </p>

                                                    <p className="truncate text-xs text-slate-500">
                                                        {friend.username
                                                            ? `@${friend.username.replace(/^@/, "")}`
                                                            : ""}
                                                    </p>
                                                </div>

                                                {/* Selection */}
                                                <div
                                                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${selected
                                                        ? "border-cyan-500 bg-cyan-500 text-white"
                                                        : "border-slate-600"
                                                        }`}
                                                >
                                                    {selected && <FiCheck size={13} />}
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 border-t border-slate-800 bg-slate-900 px-5 py-4">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 cursor-pointer rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={handleCreate}
                            disabled={
                                !groupName.trim() ||
                                selectedFriends.length < 2
                            }
                            className="flex-1 cursor-pointer rounded-xl bg-cyan-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                            Create Group
                        </button>
                    </div>

                    {selectedFriends.length < 2 && (
                        <p className="mt-2 text-center text-[11px] text-slate-500">
                            Select at least 2 friends
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}