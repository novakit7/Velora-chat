import { User } from "../models/User.model.js";
import {
  addUserSocket,
  removeUserSocket,
  getOnlineUsers,
  isUserOnline,
} from "./onlineUsers.js";

import { SOCKET_EVENTS } from "../constants.js";
import { getIO } from "./index.js";

export const socketHandler = (socket) => {
  const io = getIO();

  const userId = socket.user._id.toString();

  addUserSocket(userId, socket.id);

  console.log(`${socket.user.username} connected`);

  // Send current online users only to this client
  socket.emit(
    SOCKET_EVENTS.ONLINE_USERS,
    getOnlineUsers()
  );

  // Notify everyone else this user came online
  socket.broadcast.emit(
    SOCKET_EVENTS.USER_ONLINE,
    {
      userId,
    }
  );

  socket.on("disconnect", async (reason) => {
    removeUserSocket(userId, socket.id);

    // User still has another socket open
    if (isUserOnline(userId)) {
      return;
    }

    const lastSeen = new Date();

    await User.findByIdAndUpdate(userId, {
      lastSeen,
    });

    io.emit(
      SOCKET_EVENTS.USER_OFFLINE,
      {
        userId,
        lastSeen,
      }
    );

    console.log(
      `${socket.user.username} disconnected (${reason})`
    );
  });
};