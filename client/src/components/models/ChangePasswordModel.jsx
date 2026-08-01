import React, { useEffect, useRef, useState } from "react";
import {
    FiEye,
    FiEyeOff,
    FiLoader,
    FiLock,
    FiX,
} from "react-icons/fi";
import { notify } from "../../utils/toast";

function PasswordInput({
    value,
    name,
    placeholder,
    visible,
    loading,
    onChange,
    onToggle,
}) {
    return (
        <div className="relative">
            <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />

            <input
                type={visible ? "text" : "password"}
                value={value}
                disabled={loading}
                onChange={onChange}
                placeholder={placeholder}
                className="w-full rounded-xl border border-slate-700 bg-slate-800 py-3 pl-11 pr-12 text-white outline-none transition focus:border-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
            />

            <button
                type="button"
                disabled={loading}
                onClick={onToggle}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-white disabled:cursor-not-allowed"
            >
                {visible ? <FiEyeOff /> : <FiEye />}
            </button>
        </div>
    );
}

export default function ChangePasswordModal({
    open,
    onClose,
    onSave,
    loading = false,
}) {
    const modalRef = useRef(null);

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const [show, setShow] = useState({
        old: false,
        new: false,
        confirm: false,
    });

    const resetForm = () => {
        setForm({
            currentPassword: "",
            newPassword: "",
            confirmPassword: "",
        });

        setShow({
            old: false,
            new: false,
            confirm: false,
        });
    };
    const handleClose = () => {
        if (loading) return;

        resetForm();
        onClose();
    };

    useEffect(() => {
        if (!open) return;

        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [open]);

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

    if (!open) return null;

    const handleBackdrop = (e) => {
        if (loading) return;

        if (e.target === modalRef.current) {
            handleClose();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (loading) return;

        if (
            !form.currentPassword.trim() ||
            !form.newPassword.trim() ||
            !form.confirmPassword.trim()
        ) {
            notify.error("All fields are required.");
            return;
        }

        if (form.newPassword !== form.confirmPassword) {
            notify.error("Passwords do not match.");
            return;
        }

        onSave({
            currentPassword: form.currentPassword.trim(),
            newPassword: form.newPassword.trim(),
        });
    };

    return (
        <div
            ref={modalRef}
            onMouseDown={handleBackdrop}
            className="fixed inset-0 z-100 flex min-h-screen items-center justify-center overflow-y-auto bg-black/70 p-4 backdrop-blur-sm"
        >
            <div className="my-auto w-full max-w-md rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
                    <h2 className="text-lg font-semibold text-white">
                        Change Password
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
                    className="space-y-5 p-5"
                >
                    <PasswordInput
                        name="currentPassword"
                        value={form.currentPassword}
                        placeholder="Current Password"
                        visible={show.old}
                        loading={loading}
                        onToggle={() =>
                            setShow((prev) => ({
                                ...prev,
                                old: !prev.old,
                            }))
                        }
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                currentPassword: e.target.value,
                            }))
                        }
                    />

                    <PasswordInput
                        name="newPassword"
                        value={form.newPassword}
                        placeholder="New Password"
                        visible={show.new}
                        loading={loading}
                        onToggle={() =>
                            setShow((prev) => ({
                                ...prev,
                                new: !prev.new,
                            }))
                        }
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                newPassword: e.target.value,
                            }))
                        }
                    />

                    <PasswordInput
                        name="confirmPassword"
                        value={form.confirmPassword}
                        placeholder="Confirm New Password"
                        visible={show.confirm}
                        loading={loading}
                        onToggle={() =>
                            setShow((prev) => ({
                                ...prev,
                                confirm: !prev.confirm,
                            }))
                        }
                        onChange={(e) =>
                            setForm((prev) => ({
                                ...prev,
                                confirmPassword: e.target.value,
                            }))
                        }
                    />

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
                            className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl bg-cyan-600 py-3 font-semibold text-white transition hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                            {loading && <FiLoader className="animate-spin" />}

                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}