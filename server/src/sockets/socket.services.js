import { getIO } from "./index.js";
import { getUserSockets } from "./onlineUsers.js";

export const emitToUser = (userId, event, data) => {
  const sockets = getUserSockets(userId);

  if (!sockets || sockets.size === 0) return;

  const io = getIO();

  for (const socketId of sockets) {
    io.to(socketId).emit(event, data);
  }
};

export const emitToAll = (event, data) => {
  getIO().emit(event, data);
};

export const emitToRoom = (roomId, event, data) => {
  getIO().to(roomId).emit(event, data);
};

export const broadcast = (socket, event, data) => {
  socket.broadcast.emit(event, data);
};