import jwt from "jsonwebtoken";
import cookie from "cookie";
import { User } from "../../models/User.model.js";

export const socketAuth = async (socket, next) => {
  try {
    const cookies = cookie.parse(socket.handshake.headers.cookie || "");

    const accessToken = cookies.accessToken;

    if (!accessToken) {
      return next(new Error("Unauthorized"));
    }

    const decoded = jwt.verify(
      accessToken,
      process.env.ACCESS_TOKEN_SECRET
    );

    const user = await User.findById(decoded._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      return next(new Error("Unauthorized"));
    }

    socket.user = user;

    next();
  } catch (error) {
    next(new Error("Unauthorized"));
  }
};