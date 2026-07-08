import React, { useContext, useEffect, useRef } from "react";
import {
  FiUser,
  FiSettings,
  FiEdit,
  FiMoon,
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
      <div className="flex items-center gap-4 border-b border-slate-800 p-5">
        <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-cyan-500">
          <img
            src={user?.avatar?.url}
            alt={user?.username}
            className="h-full w-full object-cover"
          />
        </div>

        <div>
          <h2 className="text-lg font-semibold text-white">{user?.username}</h2>
          <p className="text-sm text-gray-400">{user?.fullName}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="py-2">
        <button className="flex w-full items-center justify-between px-5 py-3 transition hover:bg-slate-800">
          <div className="flex items-center gap-3">
            <FiUser className="text-cyan-400" />
            <span className="text-white">My Profile</span>
          </div>
          <FiChevronRight className="text-gray-500" />
        </button>

        <button className="flex w-full items-center justify-between px-5 py-3 transition hover:bg-slate-800">
          <div className="flex items-center gap-3">
            <FiEdit className="text-cyan-400" />
            <span className="text-white">Edit Profile</span>
          </div>
          <FiChevronRight className="text-gray-500" />
        </button>

        <button className="flex w-full items-center justify-between px-5 py-3 transition hover:bg-slate-800">
          <div className="flex items-center gap-3">
            <FiSettings className="text-cyan-400" />
            <span className="text-white">Settings</span>
          </div>
          <FiChevronRight className="text-gray-500" />
        </button>

        <button className="flex w-full items-center justify-between px-5 py-3 transition hover:bg-slate-800">
          <div className="flex items-center gap-3">
            <FiMoon className="text-cyan-400" />
            <span className="text-white">Appearance</span>
          </div>
          <FiChevronRight className="text-gray-500" />
        </button>
      </div>

      {/* Logout */}
      <div className="border-t border-slate-800 p-3">
        <button
          type="button"
          onClick={() => {
            onClose(); // Close the profile dropdown
            onLogout(); // Open the logout modal
          }}
          className="flex w-full items-center justify-center gap-3 rounded-xl bg-red-500/10 py-3 text-red-400 transition hover:bg-red-500/20"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
}
