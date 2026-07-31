import { Server } from "socket.io";
import { socketHandler } from "./socketHandler.js";
import { socketAuth } from "./middlewares/socketAuth.middleware.js";

let io;

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CORS_ORIGIN,
            credentials: true,
            methods: ["GET", "POST", "PATCH", "DELETE"],
        },
    });

    // Authenticate every socket before allowing connection
    io.use(socketAuth);

    io.on("connection", (socket) => {
        console.log(
            `${socket.user.username} connected (${socket.id})`
        );

        socketHandler(socket);
    });
};

export const getIO = () => io;