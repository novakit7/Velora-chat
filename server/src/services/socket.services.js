
import { getIO } from "../sockets/index.js";
import onlineUsers from "../sockets/onlineUsers.js";

const sendToUser = (userId, event, data) => {

    const socketId = onlineUsers.get(userId.toString());

    if (!socketId) return;

    const io = getIO

    io.to(socketId).emit(event, data);

};

export { sendToUser };
