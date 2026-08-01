import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { FiBell } from "react-icons/fi";
import NotificationModal from "../models/NotificationModel";
import UserModal from "../models/UserModel.";
import LogoutModal from "../models/LogoutModel";
import AuthContext from "../../context/AuthContext";
import api from "../../api/axois";
import { notify } from "../../utils/toast";
import { useNotifications } from "../../context/NotificationContext";
import EditProfileModal from "../models/editProfileModel";
import ChangePasswordModal from "../models/ChangePasswordModel";
import { updateProfile, changePassword } from "../../services/userService";

export default function Navbar() {
  const [openNotification, setOpenNotification] = useState(false);
  const [openUser, setOpenUser] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [openLogout, setOpenLogout] = useState(false);
  const [loading, setLoading] = useState(false);


  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const { unreadCount } = useNotifications();

  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);

  const handleProfileUpdate = async (formData) => {
    try {
      setProfileLoading(true);

      const res = await updateProfile(formData);
      setUser(res.data);
      notify.success(res.message);

      setEditOpen(false);
    } catch (error) {
      notify.error(
        error?.response?.data?.message || "Failed to update profile"
      );
    } finally {
      setProfileLoading(false);
    }
  };


  const handlePasswordChange = async (payload) => {
    try {
      setPasswordLoading(true);

      const res = await changePassword(payload);

      notify.success(res.message);

      setPasswordOpen(false);
    } catch (error) {
      notify.error(
        error?.response?.data?.message || "Failed to change password"
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setLoading(true);

      const res = await api.post("/user/logout");
      setUser(null);
      notify.success(res?.data?.message || "Logout successful");
      setOpenLogout(false);
      setOpenUser(false);

      navigate("/login");
    } catch (error) {
      console.error(error);
      notify.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-center">
        <header className="flex h-16 w-[70%] items-center justify-between rounded-full border border-slate-800 bg-slate-900/95 px-6 shadow-xl backdrop-blur-md">
          {/* Left */}
          <div className="flex items-center gap-3">
            <img
              src="/favicon.png"
              alt="Velora"
              className="h-10 w-10 object-contain"
            />

            <div>
              <h1 className="text-lg font-bold text-white">Velora</h1>
              <p className="text-xs text-cyan-400">Where Conversations Flow.</p>
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpenNotification((prev) => !prev)}
              className="relative flex h-11 w-11 items-center cursor-pointer justify-center rounded-full border border-slate-700 bg-slate-800 transition-all duration-200 hover:border-slate-600 hover:bg-slate-700"
            >
              <FiBell className="text-slate-300" size={18} />

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
              onClick={() => setOpenUser((prev) => !prev)}
              className="flex h-10 w-10 items-center justify-center cursor-pointer overflow-hidden rounded-full border-2 border-cyan-500 bg-cyan-500"
            >
              {user?.avatar?.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.username}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-lg font-semibold text-white">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              )}
            </button>

            <UserModal
              open={openUser}
              onClose={() => setOpenUser(false)}
              onLogout={() => setOpenLogout(true)}
              onEdit={() => {
                setOpenUser(false);
                setEditOpen(true);
              }}
              onPassword={() => {
                setOpenUser(false);
                setPasswordOpen(true);
              }}
            />
          </div>
        </header>
      </div>
      <LogoutModal
        open={openLogout}
        onClose={() => setOpenLogout(false)}
        onConfirm={handleLogout}
        loading={loading}
      />
      <EditProfileModal
        open={editOpen}
        user={user}
        loading={profileLoading}
        onClose={() => setEditOpen(false)}
        onSave={handleProfileUpdate}
      />

      <ChangePasswordModal
        open={passwordOpen}
        loading={passwordLoading}
        onClose={() => setPasswordOpen(false)}
        onSave={handlePasswordChange}
      />
    </>
  );
}
