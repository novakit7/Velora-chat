import { useEffect, useRef } from "react";
import { FiCamera, FiEdit2, FiX } from "react-icons/fi";

export default function GroupInfoModal({
    isOpen,
    onClose,
    chat,
    setChat
}) {
    const modalRef = useRef(null);

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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
            <div
                ref={modalRef}
                className="w-full max-w-sm overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-3">
                    <h2 className="text-base font-semibold text-white">
                        Group Info
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
                    <div className="relative">
                        <img
                            src={chat.groupAvatar?.url}
                            alt={chat.groupName}
                            className="h-20 w-20 rounded-full border-2 border-slate-700 object-cover"
                        />

                        <button className="absolute bottom-0 right-0 cursor-pointer rounded-full bg-cyan-500 p-2 text-white transition hover:bg-cyan-600">
                            <FiCamera size={14} />
                        </button>
                    </div>

                    <h3 className="mt-3 text-xl font-semibold text-white">
                        {chat.groupName}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                        {chat.participants?.length || 0} Members
                    </p>
                </div>

                {/* Details */}
                <div className="space-y-4 px-5 py-5">

                    {/* Group Name */}
                    <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                            Group Name
                        </p>

                        <div className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
                            <span className="text-sm text-white">
                                {chat.groupName}
                            </span>

                            <button className="cursor-pointer text-cyan-400 transition hover:text-cyan-300">
                                <FiEdit2 size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
                            Description
                        </p>

                        <div className="flex items-start justify-between rounded-lg border border-slate-700 bg-slate-800 px-3 py-2">
                            <p className="text-sm leading-6 text-slate-300">
                                {chat.description || "No description available."}
                            </p>

                            <button className="ml-3 cursor-pointer text-cyan-400 transition hover:text-cyan-300">
                                <FiEdit2 size={16} />
                            </button>
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
    );
}