import React, { useEffect, useRef } from "react";
import {
  FiUser,
  FiSettings,
  FiEdit,
  FiMoon,
  FiLogOut,
  FiChevronRight,
} from "react-icons/fi";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../../api/axois";

export default function UserModal({ open, onClose }) {
  const { user, setUser } = useContext(AuthContext);
  const modalRef = useRef(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post("/user/logout");
      setUser(null);
      navigate("/login");
    } catch (error) {
      console.error(error);
    }
  };

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
      className="absolute top-20 right-5 z-50 w-80 rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden"
    >
      {/* Profile Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-4">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-cyan-500 flex items-center justify-center">
          <img
            src={user?.avatar?.url}
            alt={user?.username}
            className="w-full h-full object-cover"
          />
        </div>

        <div>
          <h2 className="text-white font-semibold text-lg">{user?.username}</h2>
          <p className="text-sm text-gray-400">{user?.fullName}</p>
          <p className="text-sm text-gray-400">{user?.email}</p>
        </div>
      </div>

      {/* Menu */}
      <div className="py-2">
        <button className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800 transition">
          <div className="flex items-center gap-3">
            <FiUser className="text-cyan-400" />
            <span className="text-white">My Profile</span>
          </div>

          <FiChevronRight className="text-gray-500" />
        </button>

        <button className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800 transition">
          <div className="flex items-center gap-3">
            <FiEdit className="text-cyan-400" />
            <span className="text-white">Edit Profile</span>
          </div>

          <FiChevronRight className="text-gray-500" />
        </button>

        <button className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800 transition">
          <div className="flex items-center gap-3">
            <FiSettings className="text-cyan-400" />
            <span className="text-white">Settings</span>
          </div>

          <FiChevronRight className="text-gray-500" />
        </button>

        <button className="w-full px-5 py-3 flex items-center justify-between hover:bg-slate-800 transition">
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
          onClick={handleLogout}
          className="w-full rounded-xl bg-red-500/10 py-3 flex items-center justify-center gap-3 text-red-400 hover:bg-red-500/20 transition"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </div>
  );
}
