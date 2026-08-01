import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
    useCallback,
} from "react";
import api from "../api/axois";
import { useAuth } from "../hooks/useAuth";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch notifications
    const fetchNotifications = useCallback(async () => {
        if (!user) return;

        try {
            setLoading(true);

            const res = await api.get("/notification");

            setNotifications(res.data.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    // Socket helper
    const addNotification = useCallback((notification) => {
        setNotifications((prev) => {
            const exists = prev.some(
                (item) => item._id === notification._id
            );

            if (exists) return prev;

            return [notification, ...prev];
        });
    }, []);

    const removeNotification = useCallback((notificationId) => {
        setNotifications((prev) =>
            prev.filter((item) => item._id !== notificationId)
        );
    }, []);

    // Read
    const markNotificationAsRead = useCallback(async (notificationId) => {
        try {
            await api.patch(`/notification/${notificationId}/read`);

            setNotifications((prev) =>
                prev.map((item) =>
                    item._id === notificationId
                        ? { ...item, isRead: true }
                        : item
                )
            );
        } catch (error) {
            console.error(error);
        }
    }, []);

    const markAllNotificationsAsRead = useCallback(async () => {
        try {
            await api.patch("/notification/read-all");

            setNotifications((prev) =>
                prev.map((item) => ({
                    ...item,
                    isRead: true,
                }))
            );
        } catch (error) {
            console.error(error);
        }
    }, []);

    // Delete
    const deleteNotification = useCallback(
        async (notificationId) => {
            try {
                await api.delete(`/notification/${notificationId}`);

                removeNotification(notificationId);
            } catch (error) {
                console.error(error);
            }
        },
        [removeNotification]
    );

    const deleteAllNotifications = useCallback(async () => {
        try {
            await api.delete("/notification");

            setNotifications([]);
        } catch (error) {
            console.error(error);
        }
    }, []);

    // Fetch notifications when user logs in
    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setNotifications([]);
        }
    }, [user, fetchNotifications]);

    const unreadCount = useMemo(() => {
        return notifications.filter(
            (item) => !item.isRead
        ).length;
    }, [notifications]);

    const value = useMemo(
        () => ({
            loading,

            notifications,
            unreadCount,

            fetchNotifications,

            addNotification,
            removeNotification,

            markNotificationAsRead,
            markAllNotificationsAsRead,

            deleteNotification,
            deleteAllNotifications,
        }),
        [
            loading,
            notifications,
            unreadCount,

            fetchNotifications,

            addNotification,
            removeNotification,

            markNotificationAsRead,
            markAllNotificationsAsRead,

            deleteNotification,
            deleteAllNotifications,
        ]
    );

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);

    if (!context) {
        throw new Error(
            "useNotifications must be used within NotificationProvider"
        );
    }

    return context;
};