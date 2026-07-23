import React from "react";
import Loader from "../common/Loader";

export default function LogoutModal({
  open,
  onClose,
  onConfirm,
  loading,
}) {
  if (!open) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-white">
          Confirm Logout
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Are you sure you want to logout from your account?
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex min-w-22.5 items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? <Loader variant="button" /> : "Logout"}
          </button>
        </div>
      </div>
    </div>
  );
}