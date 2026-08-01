import React, { useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiX,
} from "react-icons/fi";
import { formatRelativeDate } from "../../utils/date";
import { useNavigate } from "react-router-dom";
import Loader from "../common/Loader";
import { useNotifications } from "../../context/NotificationContext";

export default function NotificationModal({ open, onClose }) {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  const {
    notifications,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    deleteAllNotifications,
  } = useNotifications();

  // Navigate to chat
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
      }

      onClose();

      switch (notification.type) {
        case "message":
          if (notification.chat?._id) {
            navigate(`/home/chat/${notification.chat._id}`);
          }
          break;

        case "friend_request":
        case "friend_request_accepted":
        case "friend_request_rejected":
        case "friend_removed":
          navigate("/home/add-friend");
          break;

        case "group_created":
        case "group_updated":
        case "added_to_group":
        case "removed_from_group":
        case "left_group":
          if (notification.chat?._id) {
            navigate(`/home/group/${notification.chat._id}`);
          } else {
            navigate("/home/group");
          }
          break;

        case "ai_response":
          navigate("/home/ai");
          break;

        default:
          navigate("/home");
      }
      navigate(0);
    } catch (error) {
      console.error(error);
    }
  };

  // Delete notification
  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();

    try {
      setDeletingId(notificationId);

      await deleteNotification(notificationId);
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingId(null);
    }
  };

  // Delete all notifications
  const handleDeleteAllNotifications = async () => {
    try {
      setDeletingAll(true);

      await deleteAllNotifications();
    } catch (error) {
      console.error(error);
    } finally {
      setDeletingAll(false);
    }
  };

  // Mark all as read
  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);

      await markAllNotificationsAsRead();
    } catch (error) {
      console.error(error);
    } finally {
      setMarkingAll(false);
    }
  };

  // Close modal on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      ref={modalRef}
      className="absolute right-5 top-20 z-50 w-96 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
        <div className="flex items-center gap-2">
          <FiBell className="text-lg text-cyan-400" />
          <h2 className="text-lg font-semibold text-white">
            Notifications
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleMarkAllRead}
            disabled={
              markingAll ||
              deletingAll ||
              notifications.length === 0
            }
            className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-cyan-400 hover:bg-slate-800 disabled:opacity-50"
          >
            {markingAll ? (
              <Loader variant="button" />
            ) : (
              "Mark all"
            )}
          </button>

          <button
            onClick={handleDeleteAllNotifications}
            disabled={
              deletingAll ||
              markingAll ||
              notifications.length === 0
            }
            className="cursor-pointer rounded-md px-2 py-1 text-xs font-medium text-red-400 hover:bg-slate-800 disabled:opacity-50"
          >
            {deletingAll ? (
              <Loader variant="button" />
            ) : (
              "Delete all"
            )}
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="max-h-96 overflow-y-auto all-scroll">
        {loading ? (
          <Loader variant="section" />
        ) : notifications.length === 0 ? (
          <div className="flex h-72 items-center justify-center text-slate-500">
            No notifications yet
          </div>
        ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => handleNotificationClick(item)}
              className={`group flex cursor-pointer gap-4 border-b border-slate-800/50 px-5 py-4 transition hover:bg-slate-800 ${!item.isRead ? "bg-slate-800/40" : ""
                }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                {item.chat?.isGroupChat ? (
                  <img
                    src={
                      item.chat.groupAvatar?.url ||
                      "/group-avatar.png"
                    }
                    alt={item.chat.groupName}
                    className="h-12 w-12 rounded-full border border-slate-700 object-cover"
                  />
                ) : item.sender?.avatar?.url ? (
                  <img
                    src={item.sender.avatar.url}
                    alt={item.sender.username}
                    className="h-12 w-12 rounded-full border border-slate-700 object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-500 font-semibold text-white">
                    {item.sender?.username
                      ?.charAt(0)
                      .toUpperCase()}
                  </div>
                )}

                {!item.isRead && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-900 bg-cyan-400" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate font-semibold text-white">
                      {item.chat?.isGroupChat
                        ? item.chat.groupName
                        : item.sender?.username}
                    </h3>

                    <p className="mt-1 text-sm text-slate-400">
                      {item.text}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-slate-500">
                      {formatRelativeDate(item.createdAt)}
                    </span>

                    <button
                      onClick={(e) =>
                        handleDeleteNotification(e, item._id)
                      }
                      disabled={deletingId === item._id}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full opacity-0 transition hover:bg-red-500/10 group-hover:opacity-100 disabled:opacity-100"
                    >
                      {deletingId === item._id ? (
                        <Loader variant="button" />
                      ) : (
                        <FiX
                          size={15}
                          className="text-slate-500 hover:text-red-400"
                        />
                      )}
                    </button>
                  </div>
                </div>

                {item.message?.content && (
                  <div className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-sm text-slate-300">
                    {item.message.content}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
