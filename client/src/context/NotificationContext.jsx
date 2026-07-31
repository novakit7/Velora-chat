import {
    createContext,
    useContext,
    useEffect,
    useMemo,
    useState,
} from "react";
import api from "../api/axois";
import { useAuth } from "../hooks/useAuth";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useAuth();

    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch notifications
    const fetchNotifications = async () => {
        if (!user) return;

        try {
            setLoading(true);

            const res = await api.get("/notification");

            setNotifications(res.data.data);
        } finally {
            setLoading(false);
        }
    };

    // Socket helper
    const addNotification = (notification) => {
        setNotifications((prev) => {
            const exists = prev.some(
                (item) => item._id === notification._id
            );

            if (exists) return prev;

            return [notification, ...prev];
        });
    };

    const removeNotification = (notificationId) => {
        setNotifications((prev) =>
            prev.filter((item) => item._id !== notificationId)
        );
    };

    // Read
    const markNotificationAsRead = async (notificationId) => {
        await api.patch(`/notification/${notificationId}/read`);

        setNotifications((prev) =>
            prev.map((item) =>
                item._id === notificationId
                    ? { ...item, isRead: true }
                    : item
            )
        );
    };

    const markAllNotificationsAsRead = async () => {
        await api.patch("/notification/read-all");

        setNotifications((prev) =>
            prev.map((item) => ({
                ...item,
                isRead: true,
            }))
        );
    };

    // Delete
    const deleteNotification = async (notificationId) => {
        await api.delete(`/notification/${notificationId}`);

        removeNotification(notificationId);
    };

    const deleteAllNotifications = async () => {
        await api.delete("/notification");

        setNotifications([]);
    };

    // Auth lifecycle
    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setNotifications([]);
        }
    }, [user]);

    const unreadCount = useMemo(() => {
        return notifications.filter((item) => !item.isRead).length;
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
        [loading, notifications, unreadCount]
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