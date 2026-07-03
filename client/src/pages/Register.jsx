import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4 py-8 font-sans">
      <div className="w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side */}
        <div className="hidden lg:block lg:w-[45%]">
          <img
            src="/logo-hero.png"
            alt="Register"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[55%] p-6 sm:p-8 lg:p-10 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-text">
            Create<span className="text-primary">.</span>
          </h1>

          <h2 className="mt-2 text-xl sm:text-2xl font-semibold text-text">
            Join Us
          </h2>

          <p className="mt-2 text-sm text-text-secondary">
            Create your account to start chatting with your friends.
          </p>

          <form className="mt-6 space-y-4">
            {/* Full Name & Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm text-text-secondary">
                  Full Name
                </label>

                <input
                  type="text"
                  placeholder="Alex Johnson"
                  className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-text placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-text-secondary">
                  Username
                </label>

                <input
                  type="text"
                  placeholder="@alex"
                  className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-text placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block text-sm text-text-secondary">
                  Email
                </label>

                <input
                  type="email"
                  placeholder="alex@gmail.com"
                  className="w-full rounded-lg border border-border bg-input px-4 py-2.5 text-text placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-text-secondary">
                  Password
                </label>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="w-full rounded-lg border border-border bg-input px-4 py-2.5 pr-12 text-text placeholder:text-text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex items-center justify-center w-12 text-text-muted hover:text-primary transition-colors"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <FiEyeOff size={20} />
                    ) : (
                      <FiEye size={20} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Avatar */}
            <div>
              <label className="mb-2 block text-sm text-text-secondary">
                Avatar
              </label>

              <input
                type="file"
                accept="image/*"
                className="w-full rounded-lg border border-border bg-input text-text
                file:mr-4 file:rounded-md file:border-0
                file:bg-primary file:px-4 file:py-2
                file:text-sm file:font-medium
                file:text-white hover:file:bg-primary-hover
                cursor-pointer"
              />
            </div>

            {/* Reserved OTP Area (No Layout Shift) */}
            <div className="min-h-27.5">
              {!otpSent ? (
                <div className="rounded-lg border border-dashed border-border bg-input/40 p-4">
                  <p className="text-sm text-text-secondary">
                    Verify your email before creating your account.
                  </p>

                  <button
                    type="button"
                    onClick={() => setOtpSent(true)}
                    className="mt-4 w-full rounded-lg bg-secondary py-3 font-medium text-white transition hover:bg-secondary-hover"
                  >
                    Send OTP
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <label className="text-sm text-text-secondary">
                    Enter OTP
                  </label>

                  <div className="flex gap-3">
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="123456"
                      className="flex-1 rounded-lg border border-border bg-input px-4 py-2.5 text-text placeholder:text-text-muted outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                    />

                    <button
                      type="button"
                      className="rounded-lg bg-secondary px-5 text-white font-medium hover:bg-secondary-hover transition"
                    >
                      Resend
                    </button>
                  </div>

                  <p className="text-xs text-text-muted">
                    We've sent a verification code to your email.
                  </p>
                </div>
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              disabled={!otpSent}
              className={`w-full rounded-lg py-3 font-semibold transition ${
                otpSent
                  ? "bg-primary text-white hover:bg-primary-hover active:bg-primary-active"
                  : "bg-border text-text-disabled cursor-not-allowed"
              }`}
            >
              Create Account
            </button>

            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-semibold text-primary hover:text-primary-hover"
              >
                Sign In
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
