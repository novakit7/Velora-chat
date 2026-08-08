import { useEffect, useRef } from "react";
import { FiX } from "react-icons/fi";
import { useOnlineStatus } from "../../context/OnlineStatusContext";
import { formatRelativeDate } from "../../utils/date";

export default function UserInfoModal({
    isOpen,
    onClose,
    user,
}) {
    const modalRef = useRef(null);
    const { isUserOnline } = useOnlineStatus();
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
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div
                ref={modalRef}
                className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                    <h2 className="text-base font-semibold text-white">
                        User Profile
                    </h2>

                    <button
                        onClick={onClose}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
                    >
                        <FiX size={18} />
                    </button>
                </div>

                {/* Profile */}
                <div className="flex flex-col items-center border-b border-slate-800 px-5 py-5">
                    <img
                        src={user.avatar?.url}
                        alt={user.username}
                        className="h-30 w-30 rounded-full border-2 border-slate-700 object-cover"
                    />

                    <h3 className="mt-3 text-xl font-semibold text-white">
                        {user.fullName}
                    </h3>

                    <p className="text-sm text-slate-400">
                        @{user.username}
                    </p>

                    {isUserOnline(user._id) ?
                    (<span className="mt-3 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-400">
                        ● Online
                    </span>) : (<span className="mt-3 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-gray-400">
                        {formatRelativeDate(user.lastSeen)}
                    </span>)}
                </div>

                {/* Details */}
                <div className="space-y-4 px-5 py-5">

                    <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                            Email
                        </p>

                        <div className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-white">
                            {user.email}
                        </div>
                    </div>

                    <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                            Bio
                        </p>

                        <div className="min-h-17.5 rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm leading-6 text-slate-300">
                            {user.bio || "This user hasn't added a bio yet."}
                        </div>
                    </div>

                </div>

                {/* Footer */}
                <div className="border-t border-slate-800 p-4">
                    <button
                        onClick={onClose}
                        className="w-full cursor-pointer rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-white transition hover:bg-cyan-600"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}