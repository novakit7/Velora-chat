import { useEffect } from "react";
import { socket } from "./socket";
import { SocketContext } from "./SocketContext";
import { useAuth } from "../hooks/useAuth";
import { SOCKET_EVENTS } from "../constants/socketConstants";

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();

    useEffect(() => {
         console.count("SocketProvider useEffect");
        if (!user) return;

        const handleConnect = () => {
            console.log("Socket Connected:", socket.id);
            socket.emit(SOCKET_EVENTS.JOIN, user._id);
        };

        const handleDisconnect = (reason) => {
            console.log("Socket Disconnected:", reason);
        };

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);

        socket.connect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.disconnect();
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};