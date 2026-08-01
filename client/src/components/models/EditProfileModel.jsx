import React, { useEffect, useRef, useState } from "react";
import {
  FiCamera,
  FiLoader,
  FiUpload,
  FiUser,
  FiX,
} from "react-icons/fi";
import { notify } from "../../utils/toast";

export default function EditProfileModal({
  open,
  onClose,
  user,
  onSave,
  loading = false,
}) {
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [preview, setPreview] = useState("");

  const modalRef = useRef(null);

  const resetForm = () => {
    setFullName(user?.fullName || "");
    setAvatar(null);
    setPreview(user?.avatar?.url || "");
  };

  const handleClose = () => {
    if (loading) return;

    resetForm();
    onClose();
  };

  useEffect(() => {
    if (!open) return;

    resetForm();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, user]);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, loading]);

  useEffect(() => {
    return () => {
      if (preview?.startsWith("blob:")) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    const name = fullName.trim();

    // Nothing changed
    if (name === (user?.fullName || "").trim() && !avatar) {
      notify.info("No changes to update.");
      return;
    }

    const formData = new FormData();

    if (name) {
      formData.append("fullName", name);
    }

    if (avatar) {
      formData.append("avatar", avatar);
    }

    onSave(formData);
  };

  const handleBackdrop = (e) => {
    if (loading) return;

    if (e.target === modalRef.current) {
      handleClose();
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      notify.error("Please select a valid image.");
      return;
    }

    if (preview?.startsWith("blob:")) {
      URL.revokeObjectURL(preview);
    }

    setAvatar(file);
    setPreview(URL.createObjectURL(file));
  };

  return (
    <div
      ref={modalRef}
      onMouseDown={handleBackdrop}
      className="fixed inset-0 z-100 flex min-h-screen items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
    >
      <div className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-5 py-4">
          <h2 className="text-lg font-semibold text-white">
            Update Profile
          </h2>

          <button
            type="button"
            disabled={loading}
            onClick={handleClose}
            className="cursor-pointer rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed"
          >
            <FiX size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-5"
        >
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              {preview ? (
                <img
                  src={preview}
                  alt="Profile"
                  className="h-24 w-24 rounded-full border-4 border-slate-700 object-cover sm:h-28 sm:w-28"
                  onError={(e) => {
                    e.currentTarget.src = "/default-avatar.png";
                  }}
                />
              ) : (
                <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-slate-700 bg-slate-800 sm:h-28 sm:w-28">
                  <FiUser
                    size={38}
                    className="text-slate-500"
                  />
                </div>
              )}

              <label className="absolute bottom-1 right-1 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-cyan-600 text-white shadow-lg transition hover:bg-cyan-500">
                <FiCamera size={18} />

                <input
                  hidden
                  type="file"
                  accept="image/*"
                  disabled={loading}
                  onChange={handleImageChange}
                />
              </label>
            </div>

            <p className="mt-3 text-center text-xs text-slate-400">
              Click the camera icon to change your profile picture
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-300">
              Full Name
            </label>

            <input
              type="text"
              value={fullName}
              maxLength={40}
              disabled={loading}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>

          {/* Selected File */}
          {avatar && (
            <div className="flex items-center gap-2 rounded-xl bg-slate-800 p-3 text-sm text-slate-300">
              <FiUpload />
              <span className="truncate">{avatar.name}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row">
            <button
              type="button"
              disabled={loading}
              onClick={handleClose}
              className="flex-1 cursor-pointer rounded-xl border border-slate-700 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <FiLoader className="animate-spin" />
              )}

              {loading ? "Updating..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}