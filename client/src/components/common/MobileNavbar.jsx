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

export default function MobileNavbar() {

  const [openNotification, setOpenNotification] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  return (
    <>
      {/* Top Navbar */}
      <header className="md:hidden sticky top-0 z-50 bg-slate-900 border-b border-slate-800 px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-400">👋 Hello,</p>
            <h2 className="text-xl font-bold text-white">Kit</h2>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setOpenNotification(!openNotification)} className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center">
              <FiBell className="text-gray-300" size={20} />
            </button>
            <NotificationModal
                        open={openNotification}
                        onClose={() => setOpenNotification(false)}
                      />
            <button onClick={() => setOpenUser(!openUser)} className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center">
              <FiUser className="text-white" size={20} />
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