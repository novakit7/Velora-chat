import { socket } from "./socket";
import { SOCKET_EVENTS } from "../constants/socketConstants";

export const registerSocketListeners = ({
    onFriendRequest,
}) => {

    socket.on(
        SOCKET_EVENTS.FRIEND_RECEIVED,
        onFriendRequest
    );
};

export const removeSocketListeners = () => {

    socket.off(SOCKET_EVENTS.MESSAGE_NEW);
    socket.off(SOCKET_EVENTS.FRIEND_RECEIVED);
    socket.off(SOCKET_EVENTS.NOTIFICATION_NEW);

};