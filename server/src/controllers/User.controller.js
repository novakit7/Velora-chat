import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import crypto from "crypto";
import { generateOTP, sendOTP } from "../services/otp.services.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/Cloudinary.js";
import fs from "fs";
import { removeLocalFile } from "../utils/removeLocalFile.js";
import { redisClient } from "../db/redis.db.js";
import jwt from "jsonwebtoken";
import generateAccessAndRefreshToken from "../utils/generateToken.js";

const accessCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 24 * 60 * 60 * 1000, // 1 day
};

const refreshCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  maxAge: 10 * 24 * 60 * 60 * 1000, // 10 days
};

const registerUser = asyncHandler(async (req, res) => {
  try {
    const { fullName, email, username, password } = req.body;

    if (
      [fullName, email, username, password].some(
        (field) => field?.trim() === "",
      )
    ) {
      throw new ApiError(400, "All fields are required");
    }

    const existedUser = await User.findOne({
      $or: [{ email }, { username: username.toLowerCase() }],
    });

    if (existedUser) {
      throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    removeLocalFile(avatarLocalPath);

    if (!avatar) {
      throw new ApiError(500, "Failed to upload avatar");
    }

    const otp = generateOTP();

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    await redisClient.set(
      `signup:${email}`,
      JSON.stringify({
        otp: hashedOTP,
        fullName,
        email,
        username: username.toLowerCase(),
        password,
        avatar: {
          url: avatar.secure_url,
          publicId: avatar.public_id,
        },
      }),
      {
        EX: 300,
      },
    );

    await sendOTP({
      email,
      otp,
      subject: "Verify your Velora account",
      heading: "Verify your email",
      message:
        "Welcome to Velora! Use the verification code below to complete your registration.",
    });

    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Verification code sent successfully"));
  } catch (error) {
    removeLocalFile(req.file?.path);
    throw error;
  }
});

const verifyOTP = asyncHandler(async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email?.trim() || !otp?.trim()) {
      throw new ApiError(400, "Email and OTP are required");
    }

    const signupData = await redisClient.get(`signup:${email}`);

    if (!signupData) {
      throw new ApiError(400, "OTP expired. Please register again.");
    }

    const data = JSON.parse(signupData);

    const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

    if (hashedOTP !== data.otp) {
      throw new ApiError(400, "Invalid OTP");
    }

    const existedUser = await User.findOne({
      $or: [{ email: data.email }, { username: data.username }],
    });

    if (existedUser) {
      await redisClient.del(`signup:${email}`);
      throw new ApiError(409, "User already exists");
    }

    const user = await User.create({
      fullName: data.fullName,
      email: data.email,
      username: data.username,
      password: data.password,
      avatar: data.avatar,
    });

    await redisClient.del(`signup:${email}`);

    const createdUser = await User.findById(user._id).select("-password");

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    throw error;
  }
});

const signInUser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  if ((!email && !username) || !password) {
    throw new ApiError(400, "Email/Username and password are required");
  }

  const user = await User.findOne({
    $or: [{ email }, { username }],
  });
  if (!user) {
    throw new ApiError(404, "User does not exist with this email or username");
  }

  const isPasswordValid = await user.isPasswordCorrect(password);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  const { accessToken, refreshToken } =
    await generateAccessAndRefreshToken(user);
  await redisClient.set(`refreshToken:${user._id}`, refreshToken, {
    EX: 60 * 60 * 24 * 10,
  });

  const logedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("accessToken", accessToken, accessCookieOptions)
    .cookie("refreshToken", refreshToken, refreshCookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: logedInUser,
          accessToken,
          refreshToken,
        },
        "User signed in successfully",
      ),
    );
});

const logOutUser = asyncHandler(async (req, res) => {
  await redisClient.del(`refreshToken:${req.user._id}`);

  return res
    .status(200)
    .clearCookie("accessToken", accessCookieOptions)
    .clearCookie("refreshToken", refreshCookieOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw new ApiError(404, "current password and new password is required");
  }
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "user not found");
  }
  const isPasswordCurrect = await user.isPasswordCorrect(currentPassword);
  if (!isPasswordCurrect) {
    throw new ApiError(400, "invalid current password");
  }
  user.password = newPassword;
  await user.save({
    validateBeforeSave: false,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "password changed suessfullly!!"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(
      new ApiResponse(200, req.user, "Current user fetched successfully!!"),
    );
});

const updateProfile = asyncHandler(async (req, res) => {
  const { fullName } = req.body;
  const avatarLocalPath = req.file?.path;

  if (!fullName?.trim() && !avatarLocalPath) {
    throw new ApiError(
      400,
      "Please provide a full name or profile picture."
    );
  }

  const user = await User.findById(req.user?._id);

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // Update full name if provided
  if (fullName?.trim()) {
    user.fullName = fullName.trim();
  }

  // Update avatar if provided
  if (avatarLocalPath) {
    if (user.avatar?.publicId) {
      await deleteFromCloudinary(user.avatar.publicId);
    }

    const uploadedAvatar = await uploadOnCloudinary(avatarLocalPath);

    if (!uploadedAvatar?.url) {
      throw new ApiError(500, "Failed to upload avatar");
    }

    user.avatar = {
      url: uploadedAvatar.url,
      publicId: uploadedAvatar.public_id,
    };
  }

  await user.save({ validateBeforeSave: false });

  const updatedUser = await User.findById(user._id).select("-password");

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedUser,
      "Profile updated successfully."
    )
  );
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const user = await User.findOne({
    username: username.toLowerCase(),
  }).select("fullName username email avatar createdAt lastSeen");

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, user, "User profile fetched successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingToken = req.cookies.refreshToken || req.body.refreshToken;
  console.log("Incoming Token:", incommingToken);

  if (!incommingToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incommingToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    console.log("Decoded:", decodedToken);
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    const storedRefreshToken = await redisClient.get(
      `refreshToken:${user._id}`,
    );
    console.log("Stored Token:", storedRefreshToken);
    console.log("Incoming Token:", incommingToken);
    console.log("Equal:", storedRefreshToken === incommingToken);
    if (!storedRefreshToken) {
      throw new ApiError(401, "Refresh token expired");
    }
    if (incommingToken !== storedRefreshToken) {
      throw new ApiError(
        401,
        "Refresh token is expired or has already been used",
      );
    }
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshToken(user);
    await redisClient.set(`refreshToken:${user._id}`, newRefreshToken, {
      EX: 60 * 60 * 24 * 10,
    });
    return res
      .status(200)
      .cookie("accessToken", accessToken, accessCookieOptions)
      .cookie("refreshToken", newRefreshToken, refreshCookieOptions)
      .json(
        new ApiResponse(
          200,
          { accessToken, newRefreshToken },
          "Access token is refreshed sucessfully",
        ),
      );
  } catch (error) {
    console.log("Refresh Error:", error);
    throw new ApiError(
      401,
      error?.message || "something ewnt wrong while refreshing access token",
    );
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email?.trim()) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  const otp = generateOTP();

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  await redisClient.set(`forgot-password:${email}`, hashedOTP, {
    EX: 300,
  });

  await sendOTP({
    email,
    otp,
    subject: "Reset your Velora password",
    heading: "Reset your password",
    message:
      "We received a request to reset your password. Use the verification code below to continue.",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset OTP sent successfully"));
});

const resetPassword = asyncHandler(async (req, res) => {
  const { email, otp, password } = req.body;

  if (!email || !otp || !password) {
    throw new ApiError(400, "All fields are required");
  }

  const storedOTP = await redisClient.get(`forgot-password:${email}`);

  if (!storedOTP) {
    throw new ApiError(400, "OTP expired. Please request a new one.");
  }

  const hashedOTP = crypto.createHash("sha256").update(otp).digest("hex");

  if (hashedOTP !== storedOTP) {
    throw new ApiError(400, "Invalid OTP");
  }

  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  user.password = password;
  await user.save({ validateBeforeSave: false });

  await redisClient.del(`forgot-password:${email}`);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

export {
  registerUser,
  signInUser,
  logOutUser,
  changePassword,
  getCurrentUser,
  updateProfile,
  refreshAccessToken,
  getUserProfile,
  verifyOTP,
  forgotPassword,
  resetPassword,
};
