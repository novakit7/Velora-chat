import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axois";
import Loader from "../components/common/Loader";
import { notify } from "../utils/toast";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [step, setStep] = useState(1);
  const [timer, setTimer] = useState(60);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    otp: "",
    newPassword: "",
  });
  const navigate = useNavigate();

  //login..
  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.trim()) {
      setErrors((prev) => ({
        ...prev,
        email: "Email is required",
      }));
      return;
    }

    if (!password.trim()) {
      setErrors((prev) => ({
        ...prev,
        password: "Password is required",
      }));
      return;
    }

    if (password.length < 8) {
      setErrors((prev) => ({
        ...prev,
        password: "Password must be at least 8 characters",
      }));
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/user/login", {
        email,
        password,
      });

      setUser(res.data.data.user);
      localStorage.setItem("token", res.data.data.token);
      notify.success("Login Successful!");
      navigate("/home");
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to login. Please try again.";
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgetPassword = async () => {
    if (!email.trim()) {
      setErrors((prev) => ({
        ...prev,
        email: "Email is required",
      }));
      return;
    }
    try {
      setLoading(true);
      const res = await api.post("/user/forgot-password", {
        email,
      });
      notify.success(res.data.message);
      setOtpSent(true);
      setTimer(60);
      setStep(2);
    } catch (error) {
      const message =
        error.response?.data?.message || "Unable to send otp Please try again.";
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!email.trim()) {
      setErrors((prev) => ({
        ...prev,
        email: "Email is required",
      }));
      return;
    }
    if (!newPassword.trim()) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Password is required",
      }));
      return;
    }

    if (newPassword.length < 8) {
      setErrors((prev) => ({
        ...prev,
        newPassword: "Password must be at least 8 characters",
      }));
      return;
    }
    if (!otp.trim()) {
      setErrors((prev) => ({
        ...prev,
        otp: "otp is required",
      }));
      return;
    }
    try {
      setLoading(true);
      const res = await api.patch("/user/forgot-password", {
        email,
        otp,
        password: newPassword,
      });
      notify.success(res.data.message || "Password changed successfully.");
      setForgotPassword(false);
      setOtpSent(false);

      setOtp("");
      setNewPassword("");
      setEmail("");
      setStep(1);
      navigate("/");
    } catch (error) {
      const message =
        error.response?.data?.message ||
        "Unable to reset password Please try again.";
      notify.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval;

    if (step === 2 && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [step, timer]);

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
                disabled={otpSent || loading}
                onChange={(e) => {
                  setEmail(e.target.value);

                  setErrors((prev) => ({
                    ...prev,
                    email: "",
                  }));
                }}
                placeholder="alex@gmail.com"
                className={`w-full rounded-md border bg-input-focus px-4 py-2 text-text placeholder:text-text-muted outline-none transition-colors duration-200
      ${
        errors.email
          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
          : "border-border focus:border-primary focus:ring-primary/20"
      }`}
              />

              {errors.email && (
                <p className="mt-1 text-sm text-red-500">{errors.email}</p>
              )}
            </div>

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
                        disabled={loading}
                        type={showPassword ? "text" : "password"}
                        minLength={8}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);

                          setErrors((prev) => ({
                            ...prev,
                            password: "",
                          }));
                        }}
                        className={`w-full rounded-md border bg-input-focus px-4 py-2 pr-12 text-text placeholder:text-text-muted outline-none transition-colors duration-200
            ${
              errors.password
                ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                : "border-border focus:border-primary focus:ring-primary/20"
            }`}
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-text-muted hover:text-primary"
                      >
                        {showPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
                    </div>

                    {errors.password && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.password}
                      </p>
                    )}
                  </div>

                  <div className="mt-4 flex justify-end">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setForgotPassword(true);
                        setOtpSent(false);
                      }}
                      className="text-sm text-primary hover:text-primary-hover"
                    >
                      Forgot Password?
                    </button>
                  </div>
                </>
              ) : !otpSent ? (
                <>
                  <div className="rounded-lg border border-border bg-bg-secondary p-4">
                    <p className="text-sm text-text-secondary">
                      Enter your registered email address. We'll send you a
                      6-digit OTP to reset your password.
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setForgotPassword(false)}
                    className="mt-4 text-sm text-primary hover:text-primary-hover"
                  >
                    ← Back to Login
                  </button>
                </>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-lg border border-border bg-bg-secondary p-4">
                    <p className="text-sm text-text-secondary">OTP sent to</p>
                    <p className="mt-1 font-semibold text-text">{email}</p>
                  </div>

                  {/* OTP */}
                  <div>
                    <label className="mb-2 block text-sm text-text-secondary">
                      OTP
                    </label>

                    <input
                      type="text"
                      disabled={loading}
                      maxLength={6}
                      value={otp}
                      placeholder="123456"
                      onChange={(e) => {
                        setOtp(e.target.value);
                        const value = e.target.value.replace(/\D/g, "");
                        setOtp(value);
                        setErrors((prev) => ({
                          ...prev,
                          otp: "",
                        }));
                      }}
                      className={`w-full rounded-lg border bg-input-focus px-4 py-2 text-text outline-none transition
          ${
            errors.otp
              ? "border-red-500 focus:border-red-500"
              : "border-border focus:border-primary"
          }`}
                    />

                    {errors.otp && (
                      <p className="mt-1 text-sm text-red-500">{errors.otp}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label className="mb-2 block text-sm text-text-secondary">
                      New Password
                    </label>

                    <div className="relative">
                      <input
                      disabled={loading}
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);

                          setErrors((prev) => ({
                            ...prev,
                            newPassword: "",
                          }));
                        }}
                        className={`w-full rounded-md border bg-input-focus px-4 py-2 pr-12 text-text outline-none transition
            ${
              errors.newPassword
                ? "border-red-500 focus:border-red-500"
                : "border-border focus:border-primary"
            }`}
                      />

                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-text-muted hover:text-primary"
                      >
                        {showPassword ? (
                          <FiEyeOff size={20} />
                        ) : (
                          <FiEye size={20} />
                        )}
                      </button>
                    </div>

                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-500">
                        {errors.newPassword}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <button
                      type="button"
                      disabled={timer > 0 || loading}
                      onClick={handleForgetPassword}
                      className={`${
                        timer > 0
                          ? "text-gray-400 cursor-not-allowed"
                          : "text-primary hover:underline"
                      }`}
                    >
                      {timer > 0 ? `Resend OTP (${timer}s)` : "Resend OTP"}
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpSent(false);
                        setOtp("");
                        setNewPassword("");
                        setStep(1);
                        setTimer(60);
                      }}
                      className="text-primary hover:underline"
                    >
                      Change Email
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setForgotPassword(false);
                      setOtpSent(false);
                      setStep(1);
                      setTimer(60);

                      setOtp("");
                      setNewPassword("");
                      setEmail("");
                    }}
                    className="text-left text-sm text-primary hover:text-primary-hover"
                  >
                    ← Back to Login
                  </button>
                </div>
              )}
            </div>
            {/* Button */}
            <button
              type="button"
              disabled={loading}
              onClick={
                !forgotPassword
                  ? handleLogin
                  : !otpSent
                    ? handleForgetPassword
                    : handleVerifyOtp
              }
              className="w-full rounded-lg bg-primary py-2 font-semibold text-white transition hover:bg-primary-hover active:bg-primary-active "
            >
              {loading ? (
                <Loader variant="button" />
              ) : !forgotPassword ? (
                "Sign In"
              ) : !otpSent ? (
                "Send OTP"
              ) : (
                "Verify OTP"
              )}
            </button>

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
