import { User } from "../models/User.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";
import fs from "fs";
import { removeLocalFile } from "../utils/removeLocalFile.js";

import { redisClient } from "../db/redis.db.js";
import jwt from "jsonwebtoken"
import generateAccessAndRefreshToken from "../utils/generateToken.js";


const options = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
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
      $or: [{ email }, { username }],
    });

    if (existedUser) {
      throw new ApiError(409, "User already exists");
    }

    const avatarLocalPath = req.file?.path;

    if (!avatarLocalPath) {
      throw new ApiError(400, "Avatar file is required");
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath);

    if (!avatar) {
      throw new ApiError(500, "Failed to upload avatar");
    }

    const user = await User.create({
      fullName,
      email,
      username: username.toLowerCase(),
      password,
      avatar: {
        url: avatar.url,
        publicId: avatar.secure_url,
      },
    });

    const createdUser = await User.findById(user._id).select("-password");

    if (!createdUser) {
      throw new ApiError(500, "Failed to register user");
    }

    return res
      .status(201)
      .json(new ApiResponse(201, createdUser, "User registered successfully"));
  } catch (error) {
    removeLocalFile(req.file?.path);
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

  const { accessToken, refreshToken } = await generateAccessAndRefreshToken(user);
  await redisClient.set(`refreshToken:${user._id}`, refreshToken, {
    EX: 60 * 60 * 24 * 10,
  });

  const logedInUser = await User.findById(user._id).select("-password");

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
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
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
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

const updateAccountDetails = asyncHandler(async (req, res) => {
  const { fullName, email } = req.body;
  if (!fullName || !email) {
    throw new ApiError(400, "All fields are required");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        fullName: fullName,
        email: email,
      },
    },
    { returnDocument: "after"},
  ).select("-password");
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  res
    .status(200)
    .json(new ApiResponse(200, user, "Accout details Updated Successfully.."));
});

const updateUserAvatar = asyncHandler(async (req, res) => {
  const avatarLocalPath = req.file?.path;
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is Missing..");
  }
  const deleteOldAvatar = await deleteFromCloudinary(req.user.avatar.publicId);
  if (!deleteOldAvatar) {
    throw new ApiError(500, "unable to delete old avatar");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  if (!avatar.url) {
    throw new ApiError(500, "Failed to upload Avatar");
  }
  const user = await User.findByIdAndUpdate(
    req.user?._id,
    {
      $set: {
        avatar: {
          url: avatar.url,
          publicId: avatar.secure_url,
        },
      },
    },
    {
      returnDocument: "after",
    },
  ).select("-password");
  res
    .status(200)
    .json(new ApiResponse(200, user, "avatar is Updated sucessfully" ));
});

const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  if (!username?.trim()) {
    throw new ApiError(400, "Username is required");
  }

  const user = await User.findOne({
    username: username.toLowerCase(),
  }).select(
    "fullName username email avatar createdAt"
  );

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        user,
        "User profile fetched successfully"
      )
    );
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incommingToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!incommingToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incommingToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }
    const storedRefreshToken = await redisClient.get(`refreshToken:${user._id}`);

    if (!storedRefreshToken) {
      throw new ApiError(401, "Refresh token expired");
    }
    if (incommingToken !== storedRefreshToken) {
      throw new ApiError(401, "Refresh token is expired or has already been used");
    }
    const { accessToken, refreshToken: newRefreshToken } = generateAccessAndRefreshToken(user);
    await redisClient.set(`refreshToken:${user._id}`, newRefreshToken, {
      EX: 60 * 60 *24 *10,
    });
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        new ApiResponse(200, {accessToken, newRefreshToken}, "Access token is refreshed sucessfully"),
      );
  } catch (error) {
    throw new ApiError(
      401,
      error?.message || "something ewnt wrong while refreshing access token",
    );
  }
});

export {
  registerUser,
  signInUser,
  logOutUser,
  changePassword,
  getCurrentUser,
  updateAccountDetails,
  updateUserAvatar,
  refreshAccessToken,
  getUserProfile
};
