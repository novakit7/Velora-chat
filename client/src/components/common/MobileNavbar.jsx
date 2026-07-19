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


export default function MobileNavbar() {
  const [openNotification, setOpenNotification] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser, user } = useContext(AuthContext);

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

      localStorage.removeItem("accessToken");

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
              className="relative h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center"
            >
              <FiBell size={20} className="text-gray-300" />

              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <NotificationModal
              open={openNotification}
              onClose={() => setOpenNotification(false)}
            />

            <button
              onClick={() => setOpenUser(true)}
              className="w-10 h-10 rounded-full border-2 border-cyan-500 overflow-hidden"
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

      <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-md rounded-2xl border border-slate-800 bg-slate-900/95 backdrop-blur-lg shadow-2xl">

        <div className="flex items-center justify-around py-3">

          {menuItems.map((item) => (
            <button
              key={item.name}
               onClick={() => handleNavigation(item.name)}
              className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-200 ${activeTab === item.name
                  ? "bg-cyan-500 text-white scale-105 shadow-md"
                  : "text-gray-400 hover:text-cyan-400"
                }`}
            >
              {item.icon}
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