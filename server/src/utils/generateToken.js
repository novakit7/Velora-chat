import jwt from "jsonwebtoken";
import { redisClient } from "../db/redis.db.js";
import { ApiError } from "./ApiError.js";

const generateAccessAndRefreshToken = async (user) => {
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

    await Promise.all([
      redisClient.set(`accessToken:${user._id}`, accessToken, {
        EX: 60 * 15,
      }),
      redisClient.set(`refreshToken:${user._id}`, refreshToken, {
        EX: 60 * 60 * 24 * 7,
      }),
    ]);

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to generate tokens"
    );
  }
};

export default generateAccessAndRefreshToken;