import jwt from "jsonwebtoken";
import { ApiError } from "./ApiError.js";

const generateAccessAndRefreshToken = (user) => {
  try {
    const accessToken = jwt.sign(
      {
        _id: user._id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
      },
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
      }
    );

    const refreshToken = jwt.sign(
      {
        _id: user._id,
      },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
      }
    );

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to generate tokens"
    );
  }
};

export default generateAccessAndRefreshToken;