import { useContext, useState } from "react";
import api from "../../api/axois";
import AuthContext from "../../context/AuthContext";
import Loader from "../common/Loader";
import { notify } from "../../utils/toast";

import {
  FiMessageCircle,
  FiUsers,
  FiPlusCircle,
  FiCpu,
  FiUserCheck,
  FiUserPlus,
  FiLogOut,
} from "react-icons/fi";

export default function Sidebar({ activeTab, setActiveTab }) {
  const { setUser } = useContext(AuthContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const menuItems = [
    {
      name: "Chats",
      icon: <FiMessageCircle size={22} />,
    },
    {
      name: "Groups",
      icon: <FiUsers size={22} />,
    },
    {
      name: "New Chat",
      icon: <FiPlusCircle size={22} />,
    },
    {
      name: "AI",
      icon: <FiCpu size={22} />,
    },
    {
      name: "Friends",
      icon: <FiUserCheck size={22} />,
    },
    {
      name: "Add Friend",
      icon: <FiUserPlus size={22} />,
    },
  ];

  const handleLogout = async () => {
    try {
      setLoading(true);
      const res = await api.post("/user/logout");
      setUser(null);
      notify.success(res?.data?.message || "Logout successful");
    } catch (error) {
      console.error(error);
      notify.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
      setShowLogoutModal(false);
    }
  };

  return (
    <>
      <aside className="w-19.5 lg:w-20 bg-bg border border-border rounded-2xl flex flex-col py-4 shrink-0">
        <nav className="flex-1 flex flex-col items-center gap-3">
          {menuItems.map((item) => (
            <button
              key={item.name}
              title={item.name}
              onClick={() => setActiveTab(item.name)}
              className={`group relative w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer

                ${
                  activeTab === item.name
                    ? item.primary
                      ? "bg-linear-to-br from-cyan-500 to-blue-600 text-white shadow-lg scale-105"
                      : "bg-cyan-500 text-white shadow-lg scale-105"
                    : item.primary
                      ? "bg-linear-to-br from-cyan-500/80 to-blue-600/80 text-white hover:scale-105"
                      : "text-gray-400 hover:bg-slate-800 hover:text-cyan-400 hover:scale-105"
                }
              `}
            >
              {item.icon}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-slate-800 flex justify-center">
          <button
            onClick={() => setShowLogoutModal(true)}
            title="Logout"
            className="w-14 h-14 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:scale-105 transition-all duration-200"
          >
            <FiLogOut size={22} />
          </button>
        </div>
      </aside>

      {showLogoutModal && (
        <div
          onClick={() => setShowLogoutModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-80 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
          >
            <h2 className="text-xl font-semibold text-white">Logout?</h2>

            <p className="mt-2 text-sm text-gray-400">
              Are you sure you want to logout from your account?
            </p>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleLogout}
                className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 transition"
              >
                {loading ? <Loader variant="button" /> : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
