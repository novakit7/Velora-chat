import { Server } from "socket.io";
import { socketHandler } from "./socketHandler.js";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
            methods: ["GET", "POST", "PATCH", "DELETE"],
        },
    });

    io.on("connection", (socket) => {
        console.log(` Connected: ${socket.id}`);

        socketHandler(socket, io);
    });
};

export const getIO = () => io;