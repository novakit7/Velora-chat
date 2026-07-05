import React from "react";
import {
  FiBell,
  FiUser,
  FiHome,
  FiMessageCircle,
  FiUsers,
  FiSettings,
} from "react-icons/fi";
import NotificationModal from "../models/NotificationModel";
import UserModal from "../models/UserModel.";
import { useState } from "react";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

export default function MobileNavbar() {
  const [openNotification, setOpenNotification] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  return (
    <>
      {/* Top Navbar */}
      <header className="md:hidden sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            <img
              src="/favicon.png"
              alt="Velora"
              className="w-10 h-10 rounded-xl object-cover"
            />

            <div>
              <h2 className="text-base font-semibold text-white">Velora</h2>
              <p className="text-xs text-secondary">
                • Where Conversations Flow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenNotification(!openNotification)}
              className="relative flex h-10 w-10 items-center justify-center rounded-full bg-slate-800 transition hover:bg-slate-700"
            >
              <FiBell size={20} className="text-gray-300" />

              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>
            </button>

            <NotificationModal
              open={openNotification}
              onClose={() => setOpenNotification(false)}
            />

            <button
              onClick={() => setOpenUser(!openUser)}
              className="h-10 w-10 overflow-hidden rounded-full border-2 border-cyan-500 bg-cyan-500 flex items-center justify-center"
            >
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white font-semibold text-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            <UserModal open={openUser} onClose={() => setOpenUser(false)} />
          </div>
        </div>
      </header>
      {/* Bottom Navigation */}
      <nav className="md:hidden fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] bg-slate-900 border border-slate-800 rounded-2xl shadow-xl">
        <div className="flex justify-around py-3">
          <button className="text-gray-400 hover:text-cyan-400">
            <FiHome size={24} />
          </button>

          <button className="text-cyan-400">
            <FiMessageCircle size={24} />
          </button>

          <button className="text-gray-400 hover:text-cyan-400">
            <FiUsers size={24} />
          </button>

          <button className="text-gray-400 hover:text-cyan-400">
            <FiSettings size={24} />
          </button>
        </div>
      </nav>
    </>
  );
}
