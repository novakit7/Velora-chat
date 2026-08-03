import { createContext, useContext, useMemo, useState } from "react";

const OnlineStatusContext = createContext();

export const OnlineStatusProvider = ({ children }) => {
    // Stores IDs of users currently online
    const [onlineUsers, setOnlineUsers] = useState(new Set());
    const [lastSeenUsers, setLastSeenUsers] = useState(new Map());

    // Backend sends all online users when socket connects
    const setInitialOnlineUsers = (users) => {
        setOnlineUsers(new Set(users));
    };

    // Someone came online
    const userOnline = (userId) => {
        setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.add(userId);
            return next;
        });

        setLastSeenUsers((prev) => {
            const next = new Map(prev);
            next.delete(userId);
            return next;
        });
    };

    // Someone went offline
    const userOffline = (userId, lastSeen) => {
        setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.delete(userId);
            return next;
        });

        setLastSeenUsers((prev) => {
            const next = new Map(prev);
            next.set(userId, lastSeen);
            return next;
        });
    };

    // Helper used throughout the app
    const isUserOnline = (userId) => {
        return onlineUsers.has(userId);
    };
    const getLastSeen = (userId) => {
        return lastSeenUsers.get(userId);
    };

    const value = useMemo(
        () => ({
            onlineUsers,
            setInitialOnlineUsers,
            userOnline,
            userOffline,
            isUserOnline,
            getLastSeen,
        }),
        [onlineUsers]
    );

    return (
        <OnlineStatusContext.Provider value={value}>
            {children}
        </OnlineStatusContext.Provider>
    );
};

export const useOnlineStatus = () => {
    const context = useContext(OnlineStatusContext);

    if (!context) {
        throw new Error(
            "useOnlineStatus must be used inside OnlineStatusProvider"
        );
    }

    return context;
};