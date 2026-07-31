import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_URI, {
    autoConnect: false,
    withCredentials: true,

    transports: ["websocket"],

    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
});