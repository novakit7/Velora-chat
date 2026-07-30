import onlineUsers from "./onlineUsers.js";

const socketHandler = (socket, io) => {

  socket.on("disconnect", () => {

    if (socket.userId) {
      onlineUsers.delete(socket.userId);

      console.log(`${socket.userId} disconnected`);

      io.emit("onlineUsers", [...onlineUsers.keys()]);
    }
  });
};

export { socketHandler };