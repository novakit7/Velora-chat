import { useState } from "react";
import { FiBell, FiUser } from "react-icons/fi";
import NotificationModal from "../models/NotificationModel";
import UserModal from "../models/UserModel.";
import { useContext } from "react";
import AuthContext from "../../context/AuthContext";

export default function Navbar() {
  const [openNotification, setOpenNotification] = useState(false);
  const [openUser, setOpenUser] = useState(false);
    const { user, setUser } = useContext(AuthContext);

  return (
    <div className="flex justify-center">
      <header className="w-[70%] h-16 px-6 bg-slate-900/95 backdrop-blur-md border border-slate-800 rounded-full shadow-xl flex items-center justify-between">
        {/* Logo & App Name */}
        <div className="flex items-center gap-3">
          <img
            src="/favicon.png"
            alt="Velora"
            className="w-10 h-10 object-contain"
          />

          <div className="leading-tight">
            <h1 className="text-lg font-bold text-white">Velora</h1>
            <p className="text-xs text-cyan-400">Where Conversations Flow.</p>
          </div>
        </div>

        {/* Right */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpenNotification(!openNotification)}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition cursor-pointer"
          >
            <FiBell className="text-gray-300" size={18} />
          </button>
          <NotificationModal
            open={openNotification}
            onClose={() => setOpenNotification(false)}
          />

          <button
              onClick={() => setOpenUser(!openUser)}
              className="h-10 w-10 overflow-hidden rounded-full border-2 border-cyan-500 bg-cyan-500 flex items-center justify-center cursor-pointer"
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
      </header>
    </div>
  );
}
