import React, { useEffect, useRef, useState } from "react";
import {
  FiBell,
  FiX,
} from "react-icons/fi";
import { formatRelativeDate } from "../../utils/date";
import { useNavigate } from "react-router-dom";
import api from "../../api/axois";
import Loader from "../common/Loader";

export default function NotificationModal({ open, onClose }) {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);
  const [markingAll, setMarkingAll] = useState(false);

  // fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);

      const res = await api.get('/notification');
      setNotifications(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  // navigate to chat
  const handleNotificationClick = async (notification) => {
    try {
      if (!notification.isRead) {
        await api.patch(`/notification/${notification._id}/read`);
      }

      setNotifications(prev =>
        prev.map(item =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (err) {
      console.error(err);
    }

    onClose();
    navigate(`/home/chat/${notification.chat._id}`);
  };

  //handle delete notification
  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();

    try {
      setDeletingId(notificationId);

      await api.delete(`/notification/${notificationId}`);

      setNotifications(prev =>
        prev.filter(item => item._id !== notificationId)
      );
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingId(null);
    }
  };

  //delete all 
  const handleDeleteAllNotifications = async () => {
    try {
      setDeletingAll(true);

      await api.delete("/notification");

      setNotifications([]);
    } catch (err) {
      console.error(err);
    } finally {
      setDeletingAll(false);
    }
  };
  // marl all as read
  const handleMarkAllRead = async () => {
    try {
      setMarkingAll(true);

      await api.patch("/notification/read-all");

      setNotifications(prev =>
        prev.map(item => ({
          ...item,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(err);
    } finally {
      setMarkingAll(false);
    }
  };



  // effect -- model.
  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    }

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
          <FiBell className="text-cyan-400 text-lg" />
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
            className="rounded-md px-2 cursor-pointer py-1 text-xs font-medium text-cyan-400 hover:bg-slate-800 disabled:opacity-50"
          >
            {markingAll ? <Loader variant="button"/> : "Mark all"}
          </button>

          <button
            onClick={handleDeleteAllNotifications}
            disabled={
              deletingAll ||
              markingAll ||
              notifications.length === 0
            }
            className="rounded-md cursor-pointer px-2 py-1 text-xs font-medium text-red-400 hover:bg-slate-800 disabled:opacity-50"
          >
            {deletingAll ? <Loader variant="button"/> : "Delete all"}
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="max-h-96 overflow-y-auto all-scroll">

        {loading ? (
          <Loader variant="section" />) : notifications.length === 0 ? (
            <div className="flex h-72 items-center justify-center text-gray-500">
              No notifications yet
            </div>
          ) : (
          notifications.map((item) => (
            <div
              key={item._id}
              onClick={() => handleNotificationClick(item)}
              className={`group flex w-full gap-4 border-b border-slate-800/50 px-5 py-4 text-left transition-all duration-200 hover:bg-slate-800 ${!item.isRead ? "bg-slate-800/40" : ""
                }`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <img
                  src={
                    item.chat?.isGroupChat
                      ? item.chat.groupAvatar?.url || "/group-avatar.png"
                      : item.sender.avatar?.url
                  }
                  alt={
                    item.chat?.isGroupChat
                      ? item.chat?.groupName
                      : item.sender?.username
                  }
                  className="h-12 w-12 rounded-full border border-slate-700 object-cover"
                />

                {!item.isRead && (
                  <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-slate-900 bg-cyan-400" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">

                <div className="flex items-start justify-between gap-2">

                  <div>
                    <h3 className="truncate font-semibold text-white">
                      {item.chat?.isGroupChat
                        ? item.chat.groupName
                        : item.sender.username}
                    </h3>

                    <p className="mt-1 text-sm text-gray-400">
                      {item.chat?.isGroupChat ? (
                        <>
                          <span className="font-medium text-cyan-400">
                            {item.sender.username}
                          </span>{" "}
                          sent a message in{" "}
                          <span className="text-white">
                            {item.chat.groupName}
                          </span>
                        </>
                      ) : (
                        item.text
                      )}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-gray-500">
                      {formatRelativeDate(item.createdAt)}
                    </span>

                    <button
                      type="button"
                      onClick={(e) =>
                        handleDeleteNotification(e, item._id)
                      }
                      disabled={deletingId === item._id}
                      className="flex h-7 w-7 cursor-pointer items-center justify-center rounded-full opacity-0 transition-all duration-200 hover:bg-red-500/10 group-hover:opacity-100 disabled:opacity-100"
                    >
                      {deletingId === item._id ? (
                        <Loader variant="button" />
                      ) : (
                        <FiX
                          size={15}
                          className="text-gray-500 hover:text-red-400"
                        />
                      )}
                    </button>
                  </div>

                </div>

                {item.message?.content && (
                  <div className="mt-3 rounded-lg bg-slate-800 px-3 py-2 text-sm text-gray-300">
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
