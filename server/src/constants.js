export const DB_NAME = "Velora"

export const SOCKET_EVENTS = {
  // Connection
  JOIN: "join",
  ONLINE_USERS: "onlineUsers",
  USER_ONLINE: "online",
  USER_OFFLINE: 'offline',

  CHAT_CREATED: "chat:created",
  GROUP_CREATED: "group:created",
  GROUP_RENAMED: "group:renamed",
  GROUP_UPDATE_DISCRIPTION: "group:update-dis",


  // Messages
  MESSAGE_NEW: "message:new",
  MESSAGE_EDITED: "message:edited",
  MESSAGE_DELETED: "message:deleted",

  // Typing
  TYPING_START: "typing:start",
  TYPING_STOP: "typing:stop",

  // Friend Requests
  FRIEND_RECEIVED: "friend:request",
  FRIEND_ACCEPTED: "friend:accepted",
  FRIEND_REJECTED: "friend:rejected",
  FRIEND_REMOVED: "friend:removed",
  FRIEND_CANCELLED: "friend:cancelled",

  // Notifications
  NOTIFICATION_NEW: "notification:new",
  NOTIFICATION_READ: "notification:read",
};