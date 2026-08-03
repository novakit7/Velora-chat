import { useEffect } from "react";
import { socket } from "./socket";
import { SocketContext } from "./SocketContext";
import { useAuth } from "../hooks/useAuth";
import { SOCKET_EVENTS } from "../constants/socketConstants";
import { useNotifications } from "../context/NotificationContext";
import { notify } from "../utils/toast";
import { useOnlineStatus } from "../context/OnlineStatusContext";

export const SocketProvider = ({ children }) => {
    const { user } = useAuth();
    const { addNotification } = useNotifications();
    const {
        setInitialOnlineUsers,
        userOnline,
        userOffline,
    } = useOnlineStatus();

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
        const handleNotification = (notification) => {
            console.log("Socket notification received");
            addNotification(notification);
            notify.success(notification.text);
        };
        socket.on(
            SOCKET_EVENTS.NOTIFICATION_NEW,
            handleNotification
        );
        socket.on(
            SOCKET_EVENTS.ONLINE_USERS,
            (users) => {
                setInitialOnlineUsers(users);
            }
        );

        socket.on(
            SOCKET_EVENTS.USER_ONLINE,
            ({ userId }) => {
                userOnline(userId);
            }
        );

        socket.on(
            SOCKET_EVENTS.USER_OFFLINE,
            ({ userId, lastSeen }) => {
                userOffline(userId, lastSeen);
            }
        );

        socket.on("connect", handleConnect);
        socket.on("disconnect", handleDisconnect);
        socket.onAny((event, data) => {
            console.log("Socket Event:", event, data);
        });

        socket.connect();

        return () => {
            socket.off("connect", handleConnect);
            socket.off("disconnect", handleDisconnect);
            socket.off(
                SOCKET_EVENTS.NOTIFICATION_NEW,
                handleNotification
            );
            socket.off(SOCKET_EVENTS.ONLINE_USERS);

            socket.off(SOCKET_EVENTS.USER_ONLINE);

            socket.off(SOCKET_EVENTS.USER_OFFLINE);

            socket.offAny();
            socket.disconnect();
        };
    }, [user, addNotification]);

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    );
};