import { useEffect } from "react";
import { FiTrash2, FiX } from "react-icons/fi";
import Loader from "../common/Loader";

export default function DeleteChatModal({
  isOpen,
  onClose,
  onDelete,
  loading,
}) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !loading) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEsc);
    }

    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  return (
    <div
      onClick={!loading ? onClose : undefined}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-in zoom-in-95 duration-200 rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/15">
              <FiTrash2 className="text-red-500" size={24} />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">
                Delete Chat
              </h2>

              <p className="text-sm text-gray-400">
                Confirm deletion
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-slate-800 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-gray-300">
            Are you sure you want to delete this conversation?
          </p>

          <div className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3">
            <p className="text-sm text-red-400">
              This action is permanent and cannot be undone.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-slate-800 p-6">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-700 px-5 py-2 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={onDelete}
            disabled={loading}
            className="min-w-27.5 rounded-lg bg-red-600 px-5 py-2 font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? <Loader variant="button"/> : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}