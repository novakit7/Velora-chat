import { useContext, useState } from "react";
import {
  FiBell,
  FiMessageCircle,
  FiUsers,
  FiPlusCircle,
  FiCpu,
  FiUserPlus,
} from "react-icons/fi";
import LogoutModal from "../models/LogoutModel";
import NotificationModal from "../models/NotificationModel";
import UserModal from "../models/UserModel.";
import AuthContext from "../../context/AuthContext";
import { Brain } from "lucide-react";
import api from "../../api/axois";
import { notify } from "../../utils/toast";
import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";


export default function MobileNavbar() {
  const [openNotification, setOpenNotification] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, user } = useContext(AuthContext);
  const { unreadCount } = useNotifications();

  const activeTab =
    location.pathname.startsWith("/home/ai")
      ? "AI"
      : location.pathname.startsWith("/home/group")
        ? "Groups"
        : location.pathname.startsWith("/home/new-chat")
          ? "New Chat"
          : location.pathname.startsWith("/home/add-friend")
            ? "Add Friend"
            : "Chats";
  const handleNavigation = (tab) => {
    switch (tab) {
      case "Chats":
        navigate("/home");
        break;

      case "Groups":
        navigate("/home/group");
        break;

      case "New Chat":
        navigate("/home/new-chat");
        break;

      case "AI":
        navigate("/home/ai");
        break;

      case "Add Friend":
        navigate("/home/add-friend");
        break;

      default:
        navigate("/home");
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);

      await api.post("/user/logout");

      setUser(null);

      navigate("/", { replace: true });

      notify.success("Logged out successfully");
    } catch (error) {
      notify.error(
        error?.response?.data?.message || "Logout failed"
      );
    } finally {
      setLoading(false);
      setOpenLogout(false);
    }
  };

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
      icon: <FiPlusCircle size={24} />,
    },
    {
      name: "AI",
      icon: <Brain size={22} />,
    },
    {
      name: "Add Friend",
      icon: <FiUserPlus size={22} />,
    },
  ];

  return (
    <>
      {/* ---------- Top Navbar ---------- */}

      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">

        <div className="flex items-center justify-between px-4 py-3">

          <div className="flex items-center gap-3">
            <img
              src="/favicon.png"
              alt="Velora"
              className="w-10 h-10 rounded-xl"
            />

            <div>
              <h2 className="text-white font-semibold">
                Velora
              </h2>

              <p className="text-xs text-gray-400">
                Where Conversations Flow.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">

            <button
              onClick={() => setOpenNotification(true)}
              className="relative cursor-pointer h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center"
            >
              <FiBell size={20} className="text-gray-300" />
              {/* Optional unread indicator */}
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            <NotificationModal
              open={openNotification}
              onClose={() => setOpenNotification(false)}
            />

            <button
              onClick={() => setOpenUser(true)}
              className="w-10 h-10 rounded-full cursor-pointer border-2 border-cyan-500 overflow-hidden"
            >
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-cyan-500 flex items-center justify-center text-white font-bold">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
              )}
            </button>

            <UserModal
              open={openUser}
              onClose={() => setOpenUser(false)}
              onLogout={() => {
                setOpenUser(false);
                setOpenLogout(true);
              }}
            />

          </div>

        </div>

      </header>

      {/* ---------- Bottom Navigation ---------- */}
      <nav className="fixed bottom-3 left-1/2 z-50 w-[95%] max-w-md -translate-x-1/2 rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl backdrop-blur-lg">
        <div className="flex items-center justify-around py-2">
          {menuItems.map((item) => (
            <button
              key={item.name}
              onClick={() => handleNavigation(item.name)}
              className={`group flex min-w-14.5 flex-col items-center justify-center rounded-xl px-2 py-2 transition-all duration-200 ${activeTab === item.name
                ? "text-cyan-400"
                : "text-slate-400 hover:text-cyan-400"
                }`}
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200 ${activeTab === item.name
                  ? "bg-cyan-500 text-white shadow-md"
                  : "group-hover:bg-slate-800"
                  }`}
              >
                {item.icon}
              </div>

              <span
                className={`mt-1 text-[10px] font-medium leading-none ${activeTab === item.name
                  ? "text-cyan-400"
                  : "text-slate-400"
                  }`}
              >
                {item.name}
              </span>
            </button>
          ))}
        </div>
      </nav>
      <LogoutModal
        open={openLogout}
        onClose={() => setOpenLogout(false)}
        onConfirm={handleLogout}
        loading={loading}
      />
    </>
  );
}