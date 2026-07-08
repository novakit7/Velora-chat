import React from "react";
import { Link } from "react-router-dom";
import { FiHome, FiAlertTriangle } from "react-icons/fi";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-900 px-6">
      <div className="w-full max-w-lg rounded-3xl border border-slate-800 bg-slate-950 p-10 text-center shadow-2xl">
        {/* Icon */}
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-cyan-500/10">
          <FiAlertTriangle className="text-5xl text-cyan-400" />
        </div>

        {/* 404 */}
        <h1 className="mt-6 text-7xl font-extrabold text-cyan-400">404</h1>

        {/* Title */}
        <h2 className="mt-3 text-2xl font-semibold text-white">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="mt-3 text-slate-400">
          Oops! The page you're looking for doesn't exist or may have been
          moved.
        </p>

        {/* Button */}
        <Link
          to="/"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-6 py-3 font-medium text-white transition hover:bg-cyan-600"
        >
          <FiHome size={18} />
          Back to Home
        </Link>
      </div>
    </div>
  );
}