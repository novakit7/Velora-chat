import { socket } from "../socket";
import { SOCKET_EVENTS } from "../../constants/socketConstants";

export const registerFriendListeners = ({ onFriendRequest }) => {
  if (onFriendRequest) {
    socket.on(SOCKET_EVENTS.FRIEND_RECEIVED, onFriendRequest);
  }
};

export const removeFriendListeners = ({ onFriendRequest }) => {
  if (onFriendRequest) {
    socket.off(SOCKET_EVENTS.FRIEND_RECEIVED, onFriendRequest);
  }
};