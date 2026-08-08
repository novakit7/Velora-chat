import { useEffect, useRef, useState, useContext } from "react";
import {
  FiCamera,
  FiEdit2,
  FiX,
  FiTrash2,
  FiLogOut,
  FiCheck,
} from "react-icons/fi";
import AuthContext from "../../context/AuthContext";

export default function GroupInfoModal({
  isOpen,
  onClose,
  chat,
  onUpdate,
}) {
  const modalRef = useRef(null);
  const { user } = useContext(AuthContext);

  const [isEditing, setIsEditing] = useState(false);

  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  // --------------------------------------------------
  // Initialize form when chat changes
  // --------------------------------------------------

  useEffect(() => {
    if (!chat) return;

    setGroupName(chat.groupName || "");
    setDescription(chat.description || "");
    setGroupAvatar(null);
    setAvatarPreview(chat.groupAvatar?.url || null);
    setIsEditing(false);
  }, [chat]);

  // --------------------------------------------------
  // Close modal / Escape
  // --------------------------------------------------

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e) => {
      if (
        modalRef.current &&
        !modalRef.current.contains(e.target)
      ) {
        onClose();
      }
    };

    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside,
    );

    document.addEventListener(
      "keydown",
      handleEscape,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside,
      );

      document.removeEventListener(
        "keydown",
        handleEscape,
      );
    };
  }, [isOpen, onClose]);

  if (!isOpen || !chat) return null;

  // --------------------------------------------------
  // Permissions
  // --------------------------------------------------

  const currentUserId = user?._id?.toString();

  const isOwner =
    chat.createdBy?._id?.toString() === currentUserId;

  const isAdmin =
    chat.admins?.some(
      (admin) =>
        admin._id?.toString() === currentUserId,
    ) || false;

  // Admin OR owner can edit group information
  const canEditGroup = isOwner || isAdmin;

  // --------------------------------------------------
  // Avatar selection
  // --------------------------------------------------

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Basic validation
    if (!file.type.startsWith("image/")) {
      return;
    }

    setGroupAvatar(file);

    const previewUrl = URL.createObjectURL(file);

    setAvatarPreview(previewUrl);
  };

  // --------------------------------------------------
  // Start editing
  // --------------------------------------------------

  const handleStartEditing = () => {
    if (!canEditGroup) return;

    setGroupName(chat.groupName || "");
    setDescription(chat.description || "");
    setGroupAvatar(null);
    setAvatarPreview(chat.groupAvatar?.url || null);

    setIsEditing(true);
  };

  // --------------------------------------------------
  // Cancel editing
  // --------------------------------------------------

  const handleCancelEditing = () => {
    setGroupName(chat.groupName || "");
    setDescription(chat.description || "");
    setGroupAvatar(null);
    setAvatarPreview(chat.groupAvatar?.url || null);

    setIsEditing(false);
  };


  const handleSaveChanges = () => {
    if (!groupName.trim()) {
      return;
    }

    const updatedData = {
      groupName: groupName.trim(),
      description: description.trim(),
      groupAvatar,
    };

    console.log("Updated group:", updatedData);

    // Parent can call API later
    onUpdate?.(updatedData);

    setIsEditing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-3 backdrop-blur-sm sm:p-6">
      <div
        ref={modalRef}
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl"
      >

        <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Group Info
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Manage group information and members
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <FiX size={20} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto all-scroll">
          <div className="border-b border-slate-800 p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              {/* Avatar */}

              <div className="relative mx-auto shrink-0 sm:mx-0">
                {avatarPreview ? (
                  <img
                    src={avatarPreview}
                    alt={groupName}
                    className="h-24 w-24 rounded-full border-2 border-slate-700 object-cover"
                  />
                ) : (
                  <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-slate-700 bg-cyan-500 text-3xl font-semibold text-white">
                    {groupName
                      ?.charAt(0)
                      .toUpperCase() || "G"}
                  </div>
                )}

                {/* Edit Avatar */}

                {isEditing && canEditGroup && (
                  <>
                    <input
                      id="group-avatar-edit"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />

                    <label
                      htmlFor="group-avatar-edit"
                      className="absolute bottom-0 right-0 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-cyan-500 text-white shadow-lg transition hover:bg-cyan-600"
                    >
                      <FiCamera size={15} />
                    </label>
                  </>
                )}
              </div>

              {/* Group Information */}

              <div className="min-w-0 flex-1">
                {/* Name */}

                {isEditing && canEditGroup ? (
                  <div>
                    <label className="mb-2 block text-xs font-medium text-slate-400">
                      Group name
                    </label>

                    <input
                      type="text"
                      value={groupName}
                      onChange={(e) =>
                        setGroupName(e.target.value)
                      }
                      maxLength={100}
                      className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-lg font-semibold text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
                    />
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
                    <h2 className="truncate text-2xl font-bold text-white">
                      {chat.groupName}
                    </h2>

                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        isOwner
                          ? "bg-yellow-500/15 text-yellow-400"
                          : isAdmin
                            ? "bg-cyan-500/15 text-cyan-400"
                            : "bg-slate-700 text-slate-300"
                      }`}
                    >
                      {isOwner
                        ? "Owner"
                        : isAdmin
                          ? "Admin"
                          : "Member"}
                    </span>
                  </div>
                )}

                {/* Members */}

                <p className="mt-2 text-center text-sm text-slate-400 sm:text-left">
                  {chat.participantsCount} Members
                </p>

                {/* Description */}

                {isEditing && canEditGroup ? (
                  <div className="mt-4">
                    <label className="mb-2 block text-xs font-medium text-slate-400">
                      Description
                    </label>

                    <textarea
                      value={description}
                      onChange={(e) =>
                        setDescription(e.target.value)
                      }
                      maxLength={500}
                      rows={3}
                      placeholder="What's this group about?"
                      className="w-full resize-none rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-500"
                    />

                    <p className="mt-1 text-right text-[10px] text-slate-500">
                      {description.length}/500
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm text-slate-400">
                    {chat.description ||
                      "No group description"}
                  </p>
                )}

                {/* Created By */}

                <div className="mt-5 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-800 p-3">
                  {chat.createdBy?.avatar?.url ? (
                    <img
                      src={chat.createdBy.avatar.url}
                      alt={chat.createdBy.username}
                      className="h-10 w-10 rounded-full border border-slate-700 object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
                      {chat.createdBy?.username
                        ?.charAt(0)
                        .toUpperCase() || "U"}
                    </div>
                  )}

                  <div className="min-w-0">
                    <p className="text-xs uppercase tracking-wider text-slate-500">
                      Created By
                    </p>

                    <p className="truncate text-sm font-medium text-white">
                      {chat.createdBy?.username}
                    </p>

                    <p className="truncate text-xs text-slate-400">
                      {chat.createdBy?.fullName}
                    </p>
                  </div>
                </div>

                {/* Edit Controls */}

                {canEditGroup && (
                  <div className="mt-4 flex justify-center sm:justify-start">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={handleStartEditing}
                        className="flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-500/10 px-4 py-2 text-sm font-medium text-cyan-400 transition hover:bg-cyan-500/20"
                      >
                        <FiEdit2 size={15} />
                        Edit Group
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={handleCancelEditing}
                          className="cursor-pointer rounded-lg border border-slate-700 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          onClick={handleSaveChanges}
                          disabled={!groupName.trim()}
                          className="flex cursor-pointer items-center gap-2 rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-600 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <FiCheck size={15} />
                          Save Changes
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="border-b border-slate-800 p-6">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h3 className="text-lg font-semibold text-white">
                Members ({chat.participantsCount})
              </h3>

              {canEditGroup && (
                <button
                  type="button"
                  className="w-full rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-cyan-600 sm:w-auto"
                >
                  + Add Members
                </button>
              )}
            </div>

            <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
              {chat.participants?.map((member) => {
                const memberId =
                  member._id?.toString();

                const memberIsOwner =
                  chat.createdBy?._id?.toString() ===
                  memberId;

                const memberIsAdmin =
                  chat.admins?.some(
                    (admin) =>
                      admin._id?.toString() ===
                      memberId,
                  );

                return (
                  <div
                    key={member._id}
                    className="flex flex-col gap-4 rounded-xl border border-slate-700 bg-slate-800 p-4 sm:flex-row sm:items-center sm:justify-between"
                  >
                    {/* Member */}

                    <div className="flex min-w-0 items-center gap-3">
                      {member.avatar?.url ? (
                        <img
                          src={member.avatar.url}
                          alt={member.username}
                          className="h-11 w-11 rounded-full border border-slate-700 object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-700 text-sm font-semibold text-white">
                          {member.username
                            ?.charAt(0)
                            .toUpperCase() || "U"}
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="truncate font-medium text-white">
                            {member.username}
                          </p>

                          {memberIsOwner ? (
                            <span className="rounded-full bg-yellow-500/15 px-2 py-0.5 text-[10px] font-semibold text-yellow-400">
                              Owner
                            </span>
                          ) : memberIsAdmin ? (
                            <span className="rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
                              Admin
                            </span>
                          ) : null}
                        </div>

                        <p className="truncate text-xs text-slate-400">
                          {member.fullName}
                        </p>
                      </div>
                    </div>


                    {isOwner &&
                      memberId !== currentUserId && (
                        <div className="flex flex-wrap gap-2 sm:justify-end">
                          {!memberIsAdmin ? (
                            <button
                              type="button"
                              className="rounded-lg bg-cyan-500/10 px-3 py-2 text-xs font-medium text-cyan-400 transition hover:bg-cyan-500/20"
                            >
                              Make Admin
                            </button>
                          ) : (
                            <button
                              type="button"
                              className="rounded-lg bg-orange-500/10 px-3 py-2 text-xs font-medium text-orange-400 transition hover:bg-orange-500/20"
                            >
                              Remove Admin
                            </button>
                          )}

                          <button
                            type="button"
                            className="rounded-lg bg-red-500/10 px-3 py-2 text-xs font-medium text-red-400 transition hover:bg-red-500/20"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-5">
            <h3 className="mb-4 text-sm font-semibold text-red-400">
              Danger Zone
            </h3>

            <div className="space-y-3">
              {isOwner ? (
                <button
                  type="button"
                  onClick={() =>
                    console.log("Delete group")
                  }
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-left transition hover:bg-red-500/20"
                >
                  <div>
                    <p className="font-medium text-red-400">
                      Delete Group
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Permanently delete this group and
                      all its messages.
                    </p>
                  </div>

                  <FiTrash2
                    className="text-red-400"
                    size={20}
                  />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    console.log("Leave group")
                  }
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-left transition hover:bg-orange-500/20"
                >
                  <div>
                    <p className="font-medium text-orange-400">
                      Leave Group
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      You will stop receiving messages
                      from this group.
                    </p>
                  </div>

                  <FiLogOut
                    className="text-orange-400"
                    size={20}
                  />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}