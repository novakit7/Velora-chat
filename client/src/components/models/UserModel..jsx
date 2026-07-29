import React, { useContext, useEffect, useRef } from "react";
import {
  FiEdit,
  FiLock,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";
import AuthContext from "../../context/AuthContext";

export default function UserModal({ open, onClose, onLogout }) {
  const { user } = useContext(AuthContext);
  const modalRef = useRef(null);

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

  if (!open) return null;

  return (
    <div
      ref={modalRef}
      className="absolute right-5 top-20 z-50 w-80 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl"
    >
      {/* Profile Header */}
      <div className="border-b border-slate-800 bg-linear-to-b from-slate-800/40 to-transparent px-6 py-7">
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            <img
              src={user?.avatar?.url}
              alt={user?.username}
              className="h-24 w-24 rounded-full border-4 border-slate-700 object-cover shadow-xl"
            />

            <span
              className={`absolute bottom-1 right-1 h-5 w-5 rounded-full border-4 border-slate-900 ${user?.isOnline ? "bg-emerald-500" : "bg-slate-500"
                }`}
            />
          </div>

          <h2 className="mt-4 text-xl font-bold text-white">
            {user?.username}
          </h2>

          <p className="mt-1 text-sm text-slate-300">
            {user?.fullName}
          </p>

          <p className="mt-1 text-xs text-slate-500 break-all">
            {user?.email}
          </p>

          <div className="mt-4">
            <span
              className={`rounded-full border px-3 py-1 text-xs font-medium ${user?.isOnline
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                : "border-slate-700 bg-slate-800 text-slate-400"
                }`}
            >
              {user?.isOnline ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2 p-3">

        {/* Edit Profile */}
        <button
          onClick={() => {
            onClose();
            // navigate("/home/profile/edit");
          }}
          className="flex w-full items-center justify-between rounded-xl border border-transparent px-4 py-3 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
              <FiEdit className="text-cyan-400" />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                Edit Profile
              </p>

              <p className="text-xs text-slate-400">
                Update your account details
              </p>
            </div>
          </div>

          <FiChevronRight className="text-slate-500" />
        </button>

        {/* Change Password */}
        <button
          onClick={() => {
            onClose();
            // navigate("/home/change-password");
          }}
          className="flex w-full items-center justify-between rounded-xl border border-transparent px-4 py-3 transition-all duration-200 hover:border-slate-700 hover:bg-slate-800"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10">
              <FiLock className="text-amber-400" />
            </div>

            <div className="text-left">
              <p className="text-sm font-semibold text-white">
                Change Password
              </p>

              <p className="text-xs text-slate-400">
                Keep your account secure
              </p>
            </div>
          </div>

          <FiChevronRight className="text-slate-500" />
        </button>

      </div>

      {/* Logout */}
      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={() => {
            onClose();
            onLogout();
          }}
          className="flex w-full items-center justify-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 py-3 font-medium text-red-400 transition-all duration-200 hover:border-red-500/40 hover:bg-red-500/20"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
}
