import {
  addUserSocket,
  removeUserSocket,
  getOnlineUsers,
} from "./onlineUsers.js";

import { SOCKET_EVENTS } from "../constants.js";
import { getIO } from "./index.js";

export const socketHandler = (socket) => {
  const io = getIO();

  const userId = socket.user._id.toString();

  addUserSocket(userId, socket.id);

  console.log(`S ${socket.user.username} connected`);

  io.emit(
    SOCKET_EVENTS.ONLINE_USERS,
    getOnlineUsers()
  );

  socket.on("disconnect", (reason) => {
    removeUserSocket(userId, socket.id);

    io.emit(
      SOCKET_EVENTS.ONLINE_USERS,
      getOnlineUsers()
    );

    console.log(
      ` ${socket.user.username} disconnected (${reason})`
    );
  });
};