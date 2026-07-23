import React, { useEffect, useState } from "react";
import Loader from "../common/Loader";

export default function EditTitleModal({
  open,
  onClose,
  onConfirm,
  loading,
  initialTitle = "",
}) {
  const [title, setTitle] = useState("");

  useEffect(() => {
    if (open) {
      setTitle(initialTitle);
    }
  }, [open, initialTitle]);

  if (!open) return null;

  const handleSubmit = () => {
    if (!title.trim()) return;
    onConfirm(title.trim());
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-9999 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
      >
        <h2 className="text-xl font-semibold text-white">
          Edit Chat Title
        </h2>

        <p className="mt-2 text-sm text-gray-400">
          Update your chat title.
        </p>

        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter title..."
          className="mt-4 w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-2 text-white outline-none focus:border-blue-500"
        />

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg bg-slate-700 px-4 py-2 text-white hover:bg-slate-600 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={loading || !title.trim()}
            className="flex min-w-22.5 items-center justify-center rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? <Loader variant="button" /> : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}