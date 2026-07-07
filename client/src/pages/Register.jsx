import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { Link } from "react-router-dom";
import { notify } from "../utils/toast";
import { useContext } from "react";
import AuthContext from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import api from "../api/axois";
import Loader from "../components/common/Loader";

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [timer, setTimer] = useState(60);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [otpVerified, setOtpVerified] = useState(false);
  const { user, setUser } = useContext(AuthContext);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    otp: "",
    username: "",
    fullName: "",
    avatar: "",
  });

  useEffect(() => {
  if (!otpSent || timer <= 0) return;

  const interval = setInterval(() => {
    setTimer((prev) => prev - 1);
  }, 1000);

  return () => clearInterval(interval);
}, [otpSent, timer]);
  const navigate = useNavigate();

  const validateForm = () => {
    let newErrors = {
      fullName: "",
      username: "",
      email: "",
      password: "",
      otp: "",
    };

    let valid = true;

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
      valid = false;
    }

    if (!username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    } else if (username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
      valid = false;
    }

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email)) {
      newErrors.email = "Invalid email";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  };

  const handleRegisterUser = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("fullName", fullName);
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);

      if (avatar) {
        formData.append("avatar", avatar);
      }

      const res = await api.post("/user/register", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setOtpSent(true);
      setTimer(60);

      notify.success(res.data.message || "OTP sent successfully.");
    } catch (error) {
      notify.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyUser = async () => {
    if (!otp.trim()) {
      setErrors((prev) => ({
        ...prev,
        otp: "OTP is required",
      }));
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/user/verify", {
        email,
        otp,
      });

      notify.success(res.data.message || "Registration successful.");

      if (res.data.data) {
        setUser(res.data.data);
      }

      navigate("/home");
    } catch (error) {
      notify.error(error.response?.data?.message || "Invalid OTP.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-1 py-4 font-sans">
      <div className="w-full max-w-7xl bg-card border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col lg:flex-row">
        {/* Left Side */}
        <div className="hidden lg:block lg:w-[40%]">
          <img
            src="/logo-hero.png"
            alt="Register"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-[60%] p-6 sm:p-8 lg:p-8 flex flex-col justify-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-text">
            Create<span className="text-primary">.</span>
          </h1>
          <p className="mt-2 text-sm text-text-secondary">
            Create your account to start chatting with your friends.
          </p>

          <form className="mt-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Name */}
              <div>
                <label
                  htmlFor="fullName"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Full Name
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setErrors((prev) => ({ ...prev, fullName: "" }));
                  }}
                  disabled={loading}
                  placeholder="Alex Johnson"
                  className={`w-full rounded-xl border bg-input px-4 py-3 text-text placeholder:text-text-muted outline-none transition-all duration-200
      ${
        errors.fullName
          ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
          : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
      }`}
                />

                {errors.fullName && (
                  <p className="mt-2 text-sm text-red-500">{errors.fullName}</p>
                )}
              </div>

              {/* Username */}
              <div>
                <label
                  htmlFor="username"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Username
                </label>

                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrors((prev) => ({ ...prev, username: "" }));
                  }}
                  disabled={loading}
                  placeholder="@alex"
                  className={`w-full rounded-xl border bg-input px-4 py-3 text-text placeholder:text-text-muted outline-none transition-all duration-200
      ${
        errors.username
          ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
          : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
      }`}
                />

                {errors.username && (
                  <p className="mt-2 text-sm text-red-500">{errors.username}</p>
                )}
              </div>
            </div>

            {/* Email & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Email */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Email
                </label>

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({ ...prev, email: "" }));
                  }}
                  disabled={loading}
                  placeholder="alex@gmail.com"
                  className={`w-full rounded-xl border bg-input px-4 py-3 text-text placeholder:text-text-muted outline-none transition-all duration-200
      ${
        errors.email
          ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
          : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
      }`}
                />

                {errors.email && (
                  <p className="mt-2 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <label
                  htmlFor="password"
                  className="mb-2 block text-sm font-medium text-text"
                >
                  Password
                </label>

                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrors((prev) => ({ ...prev, password: "" }));
                    }}
                    disabled={loading}
                    placeholder="••••••••"
                    className={`w-full rounded-xl border bg-input px-4 py-3 pr-12 text-text placeholder:text-text-muted outline-none transition-all duration-200
        ${
          errors.password
            ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
        }`}
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute inset-y-0 right-0 flex w-12 items-center justify-center text-text-muted transition-colors hover:text-primary"
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

                {errors.password && (
                  <p className="mt-2 text-sm text-red-500">{errors.password}</p>
                )}
              </div>
            </div>

            {/* Avatar */}
            <div>
              <div>
                <label className="mb-2 block text-sm font-medium text-text-secondary">
                  Profile Picture
                </label>

                <label
                  className={`flex cursor-pointer items-center justify-between rounded-xl border-2 border-dashed px-4 py-4 transition
                  ${
                    errors.avatar
                      ? "border-red-500 bg-red-500/5"
                      : "border-border hover:border-primary hover:bg-primary/5"
                  }`}
                >
                  <div>
                    <p className="font-medium text-text">
                      {avatar ? avatar.name : "Choose an image"}
                    </p>

                    <p className="mt-1 text-sm text-text-muted">
                      PNG, JPG or JPEG (Max 5MB)
                    </p>
                  </div>

                  <span className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-white">
                    Browse
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];

                      if (!file) return;

                      if (file.size > 5 * 1024 * 1024) {
                        setErrors((prev) => ({
                          ...prev,
                          avatar: "Image size must be less than 5MB",
                        }));
                        return;
                      }

                      setAvatar(file);

                      setErrors((prev) => ({
                        ...prev,
                        avatar: "",
                      }));
                    }}
                  />
                </label>

                {errors.avatar && (
                  <p className="mt-2 text-sm text-red-500">{errors.avatar}</p>
                )}
              </div>

              {errors.avatar && (
                <p className="mt-1 text-sm text-red-500">{errors.avatar}</p>
              )}
            </div>

            {/* Email Verification */}
            <div className="min-h-45">
              {!otpSent ? (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                  <h3 className="text-lg font-semibold text-text">
                    Email Verification
                  </h3>

                  <p className="mt-0 text-sm text-text-secondary">
                    We'll send a 6-digit verification code to your email
                    address.
                  </p>

                  <button
                    type="button"
                    onClick={handleRegisterUser}
                    disabled={loading}
                    className="mt-6 w-45 rounded-xl bg-secondary py-1.5 font-semibold text-white transition hover:bg-secondary-hover disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ?  <Loader variant="button"/> : "Send OTP"}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-text">
                        Verify Email
                      </h3>

                      <p className="mt-1 text-sm text-text-secondary">
                        Enter the 6-digit code sent to
                      </p>

                      <p className="font-medium text-primary break-all">
                        {email}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleRegisterUser}
                      disabled={loading || timer > 0}
                      className="rounded-xl border border-border px-4 py-2 text-sm font-medium text-text transition hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {timer > 0 ? `${timer}s` : "Resend"}
                    </button>
                  </div>

                  <div className="mt-5">
                    <label
                      htmlFor="otp"
                      className="mb-2 block text-sm font-medium text-text"
                    >
                      Verification Code
                    </label>

                    <input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => {
                        setOtp(e.target.value);
                        setErrors((prev) => ({
                          ...prev,
                          otp: "",
                        }));
                      }}
                      placeholder="Enter 6-digit OTP"
                      className={`w-full rounded-xl border bg-input px-4 py-3 text-center text-lg tracking-[0.35em] text-text outline-none transition
          ${
            errors.otp
              ? "border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-border focus:border-primary focus:ring-2 focus:ring-primary/20"
          }`}
                    />

                    {errors.otp && (
                      <p className="mt-2 text-sm text-red-500">{errors.otp}</p>
                    )}
                  </div>

                  <p className="mt-4 text-xs text-text-muted">
                    Didn't receive the code? You can request a new one after the
                    timer expires.
                  </p>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleVerifyUser}
              disabled={!otpSent || loading}
              className={`mt-1 flex w-full items-center justify-center rounded-xl py-3.5 font-semibold transition-all duration-200
    ${
      !otpSent || loading
        ? "cursor-not-allowed bg-primary/60 text-white opacity-70"
        : "bg-primary text-white shadow-lg shadow-primary/20 hover:-translate-y-0.5 hover:bg-primary-hover"
    }`}
            >
              {loading ? (
                <Loader variant="button"/>
              ) : (
                "Verify & Create Account"
              )}
            </button>

            {/* Divider */}
            <div className="my-2 flex items-center gap-4">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-text-muted">OR</span>
              <div className="h-px flex-1 bg-border" />
            </div>

            {/* Login Link */}
            <p className="text-center text-sm text-text-secondary">
              Already have an account?{" "}
              <Link
                to="/"
                className="font-semibold text-primary transition-colors hover:text-primary-hover"
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
