import onlineUsers from "./onlineUsers.js";

const socketHandler = (socket, io) => {
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);

    console.log(onlineUsers);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
};

export {socketHandler};
