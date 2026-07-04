import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link, Links } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axois";

export default function Login() {
  const { user, setUser } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  useEffect(() => {
    console.log(user);
  }, [user]);

  const handleLogin = (e) => {
    e.preventDefault();

    setUser({
      name: "Kit",
      email,
    });

    navigate("/home");
  };

  return (
    <div className="min-h-screen bg-bg text-text font-sans flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-5xl bg-card border border-border rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side */}
        <div className="w-full lg:w-1/2 p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          <h1 className="text-5xl font-bold tracking-tight text-text">
            Hello<span className="text-primary">.</span>
          </h1>

          <h2 className="mt-3 text-2xl sm:text-3xl font-semibold text-text">
            {forgotPassword ? "Forgot Password" : "Welcome Back"}
          </h2>

          <p className="mt-3 text-sm sm:text-base text-text-secondary">
            {forgotPassword
              ? "Enter the OTP sent to your registered email address."
              : "Welcome to your special page. Sign in to continue your journey."}
          </p>

          <form className="mt-8 space-y-5">
            {/* Email */}
            <div>
              <label className="mb-2 block text-sm font-medium text-text-secondary">
                Email
              </label>

              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@gmail.com"
                className="w-full rounded-md border border-border bg-input px-4 py-3 text-text placeholder:text-text-muted outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
            </div>

            {/* Reserved Area (No Layout Shift) */}
            <div className="min-h-42.5">
              {!forgotPassword ? (
                <>
                  {/* Password */}
                  <div>
                    <label className="mb-2 block text-sm text-text-secondary">
                      Password
                    </label>

                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full rounded-md border border-border bg-input px-4 py-3 text-text placeholder:text-text-muted outline-none transition-colors duration-200 focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-text-muted hover:text-primary transition"
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

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setForgotPassword(true)}
                      className="text-sm text-primary hover:text-primary-hover"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm text-text-secondary">
                      OTP
                    </label>

                    <div className="flex gap-3">
                      <input
                        type="text"
                        maxLength={6}
                        placeholder="123456"
                        className="flex-1 rounded-lg border border-border bg-input px-4 py-3 text-text placeholder:text-text-muted outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                      />

                      <button
                        type="button"
                        className="rounded-lg bg-secondary px-5 text-white font-medium transition hover:bg-secondary-hover"
                      >
                        Send
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-text-muted">
                    Didn't receive the code? Check your spam folder or resend
                    the OTP.
                  </p>

                  <button
                    type="button"
                    onClick={() => setForgotPassword(false)}
                    className="text-sm text-primary hover:text-primary-hover"
                  >
                    ← Back to Login
                  </button>
                </div>
              )}
            </div>

            {/* Button */}
            <button
              type="button"
              onClick={handleLogin}
              className="w-full rounded-lg bg-primary py-3 font-semibold text-white transition hover:bg-primary-hover active:bg-primary-active"
            >
              {forgotPassword ? "Verify OTP" : "Sign In"}
            </button>
            <Link to="/home" className="text-primary">
              bypass login
            </Link>

            {!forgotPassword && (
              <p className="text-center text-sm text-text-secondary">
                Don't have an account?{" "}
                <Link
                  to="/register"
                  className="font-semibold text-primary hover:text-primary-hover"
                >
                  Create Account
                </Link>
              </p>
            )}
          </form>
        </div>

        {/* Right Side */}
        <div className="hidden lg:flex lg:w-1/2 bg-bg-secondary items-center justify-center">
          <img
            src="/logo-hero.png"
            alt="Login"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
