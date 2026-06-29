import { socketHandler } from "./socketHandler.js";
let io;

const initializeSocket = (socketIo) => {
    io = socketIo;

    io.on("connection", (socket) => {
        console.log("Connected:", socket.id);

        socketHandler(socket, io);

        socket.on("disconnect", () => {
            console.log("Disconnected:", socket.id);
        });
    });
};

const getIO = () => io;

export {initializeSocket, getIO}