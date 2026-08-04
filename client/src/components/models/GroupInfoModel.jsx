import { useEffect, useRef, useContext } from "react";
import { FiCamera, FiEdit2, FiX, FiTrash2 } from "react-icons/fi";
import AuthContext from "../../context/AuthContext";

export default function GroupInfoModal({
    isOpen,
    onClose,
    chat,
    setChat
}) {
    const modalRef = useRef(null);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        if (!isOpen) return;

        const handleClickOutside = (e) => {
            if (modalRef.current && !modalRef.current.contains(e.target)) {
                onClose();
            }
        };

        const handleEscape = (e) => {
            if (e.key === "Escape") {
                onClose();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleEscape);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleEscape);
        };
    }, [isOpen, onClose]);

    if (!isOpen || !chat) return null;

    return (

        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6">
            <div
                ref={modalRef}
                className="flex h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            >
                {/* Profile */}
                <div className="border-b border-slate-800 p-6">
                    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center">

                        {/* Avatar */}
                        <div className="relative shrink-0">
                            <img
                                src={chat.groupAvatar?.url}
                                alt={chat.groupName}
                                className="h-24 w-24 rounded-full border-2 border-slate-700 object-cover"
                            />

                            {chat.isAdmin && (
                                <>
                                    <input
                                        id="group-avatar"
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                    />

                                    <label
                                        htmlFor="group-avatar"
                                        className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg transition hover:bg-cyan-600"
                                    >
                                        <FiCamera size={15} />
                                    </label>
                                </>
                            )}
                        </div>

                        {/* Info */}
                        <div className="min-w-0 flex-1 text-center sm:text-left">

                            <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                                <h2 className="truncate text-2xl font-bold text-white">
                                    {chat.groupName}
                                </h2>

                                <span
                                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${chat.createdBy?._id === user._id
                                        ? "bg-yellow-500/15 text-yellow-400"
                                        : chat.isAdmin
                                            ? "bg-cyan-500/15 text-cyan-400"
                                            : "bg-slate-700 text-slate-300"
                                        }`}
                                >
                                    {chat.createdBy?._id === user._id
                                        ? "Owner"
                                        : chat.isAdmin
                                            ? "Admin"
                                            : "Member"}
                                </span>
                            </div>

                            <p className="mt-2 text-sm text-slate-400">
                                {chat.participantsCount} Members
                            </p>

                            {/* Created By */}
                            <div className="mt-5 flex items-center justify-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3 sm:justify-start">

                                <img
                                    src={chat.createdBy?.avatar?.url}
                                    alt={chat.createdBy?.username}
                                    className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                                />

                                <div className="min-w-0">
                                    <p className="text-xs uppercase tracking-wider text-slate-500">
                                        Created By
                                    </p>

                                    <p className="truncate text-sm font-medium text-white">
                                        {chat.createdBy?.username}
                                    </p>

                                    <p className="truncate text-xs text-slate-400">
                                        {chat.createdBy?.fullName}
                                    </p>
                                </div>

                            </div>

                        </div>

                    </div>
                </div>
                {/* Members */}
                <div className="border-t border-slate-800 p-6">

                    <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <h3 className="text-lg font-semibold text-white">
                            Members ({chat.participantsCount})
                        </h3>

                        {chat.isAdmin && (
                            <button className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-600 sm:w-auto">
                                + Add Members
                            </button>
                        )}
                    </div>

                    <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                        {chat.participants.map((member) => {
                            const isOwner = chat.createdBy?._id === member._id;

                            const isAdmin = chat.admins.some(
                                (admin) => admin._id === member._id
                            );

                            return (
                                <div
                                    key={member._id}
                                    className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between"
                                >
                                    {/* Left */}
                                    <div className="flex items-center gap-3 min-w-0">

                                        <img
                                            src={member.avatar?.url}
                                            alt={member.username}
                                            className="h-11 w-11 rounded-full border border-slate-700 object-cover"
                                        />

                                        <div className="min-w-0">

                                            <div className="flex flex-wrap items-center gap-2">

                                                <p className="truncate font-medium text-white">
                                                    {member.username}
                                                </p>

                                                {isOwner ? (
                                                    <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                                                        Owner
                                                    </span>
                                                ) : isAdmin ? (
                                                    <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                                                        Admin
                                                    </span>
                                                ) : null}

                                            </div>

                                            <p className="truncate text-xs text-slate-400">
                                                {member.fullName}
                                            </p>

                                        </div>

                                    </div>

                                    {/* Actions */}
                                    {chat.createdBy?._id === user._id &&
                                        member._id !== user._id && (

                                            <div className="flex flex-wrap gap-2 sm:justify-end">

                                                {!isAdmin ? (
                                                    <button className="rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/20">
                                                        Make Admin
                                                    </button>
                                                ) : (
                                                    <button className="rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-400 transition hover:bg-orange-500/20">
                                                        Remove Admin
                                                    </button>
                                                )}

                                                <button className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20">
                                                    Remove
                                                </button>

                                            </div>

                                        )}

                                </div>
                            );
                        })}
                    </div>

                </div>
                {/* Danger Zone */}
                <div className="border-t border-slate-800 px-5 py-5">

                    <h3 className="mb-4 text-sm font-semibold text-red-400">
                        Danger Zone
                    </h3>

                    <div className="space-y-3">

                        {/* Owner */}
                        {chat.createdBy?._id === user._id ? (
                            <>
                                <button
                                    onClick={() => setShowDeleteGroupModal(true)}
                                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left transition hover:bg-red-500/20"
                                >
                                    <div>
                                        <p className="font-medium text-red-400">
                                            Delete Group
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            Permanently delete this group and all its messages.
                                        </p>
                                    </div>

                                    <FiTrash2 className="text-red-400" size={20} />
                                </button>
                            </>
                        ) : (
                            <>
                                {/* Member/Admin */}
                                <button
                                    onClick={() => setShowLeaveGroupModal(true)}
                                    className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-left transition hover:bg-orange-500/20"
                                >
                                    <div>
                                        <p className="font-medium text-orange-400">
                                            Leave Group
                                        </p>

                                        <p className="mt-1 text-xs text-slate-400">
                                            You will stop receiving messages from this group.
                                        </p>
                                    </div>

                                    <FiLogOut className="text-orange-400" size={20} />
                                </button>
                            </>
                        )}

                    </div>

                </div>
            </div>
        </div>
    );
}