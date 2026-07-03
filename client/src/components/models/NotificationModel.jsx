import React, { useEffect, useRef } from "react";
import {
  FiBell,
  FiCheckCircle,
  FiMessageCircle,
  FiUserPlus,
} from "react-icons/fi";

const notifications = [
  {
    id: 1,
    icon: <FiMessageCircle />,
    title: "New Message",
    description: "Rahul sent you a message.",
    time: "2 min ago",
    unread: true,
  },
  {
    id: 2,
    icon: <FiUserPlus />,
    title: "New Friend Request",
    description: "Aman wants to connect.",
    time: "15 min ago",
    unread: true,
  },
  {
    id: 3,
    icon: <FiCheckCircle />,
    title: "Profile Updated",
    description: "Your profile was updated successfully.",
    time: "Yesterday",
    unread: false,
  },
];

export default function NotificationModal({ open, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        onClose();
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      ref={modalRef}
      className="absolute right-5 top-20 z-50 w-96 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2">
          <FiBell className="text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">
            Notifications
          </h2>
        </div>

        <button className="text-sm text-cyan-400 hover:text-cyan-300">
          Mark all read
        </button>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto">
        {notifications.map((item) => (
          <button
            key={item.id}
            className={`w-full text-left flex gap-4 px-5 py-4 transition hover:bg-slate-800 ${
              item.unread ? "bg-slate-800/40" : ""
            }`}
          >
            <div className="mt-1 text-cyan-400 text-xl">
              {item.icon}
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-white">
                  {item.title}
                </h3>

                {item.unread && (
                  <span className="h-2 w-2 rounded-full bg-cyan-400" />
                )}
              </div>

              <p className="mt-1 text-sm text-gray-400">
                {item.description}
              </p>

              <p className="mt-2 text-xs text-gray-500">
                {item.time}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}