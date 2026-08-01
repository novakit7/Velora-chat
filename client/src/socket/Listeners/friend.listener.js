import { socket } from "../socket";
import { SOCKET_EVENTS } from "../../constants/socketConstants";

export const registerFriendListeners = ({
  onFriendReceived,
  onRequestAccepted,
  onRequestRejected,
  onRequestCancelled,
  onFriendRemoved,
}) => {
  if (onFriendReceived) {
    socket.on(
      SOCKET_EVENTS.FRIEND_RECEIVED,
      onFriendReceived
    );
  }

  if (onRequestAccepted) {
    socket.on(
      SOCKET_EVENTS.FRIEND_ACCEPTED,
      onRequestAccepted
    );
  }

  if (onRequestRejected) {
    socket.on(
      SOCKET_EVENTS.FRIEND_REJECTED,
      onRequestRejected
    );
  }

  if (onFriendRemoved) {
    socket.on(
      SOCKET_EVENTS.FRIEND_REMOVED,
      onFriendRemoved
    );
  }
  if (onRequestCancelled) {
  socket.on(
    SOCKET_EVENTS.FRIEND_CANCELLED,
    onRequestCancelled
  );
}
};

export const removeFriendListeners = ({
  onFriendReceived,
  onRequestAccepted,
  onRequestRejected,
  onRequestCancelled,
  onFriendRemoved,
}) => {
  if (onFriendReceived) {
    socket.off(
      SOCKET_EVENTS.FRIEND_RECEIVED,
      onFriendReceived
    );
  }

  if (onRequestAccepted) {
    socket.off(
      SOCKET_EVENTS.FRIEND_ACCEPTED,
      onRequestAccepted
    );
  }

  if (onRequestRejected) {
    socket.off(
      SOCKET_EVENTS.FRIEND_REJECTED,
      onRequestRejected
    );
  }

  if (onRequestCancelled) {
    socket.off(
      SOCKET_EVENTS.FRIEND_CANCELLED,
      onRequestCancelled
    );
  }

  if (onFriendRemoved) {
    socket.off(
      SOCKET_EVENTS.FRIEND_REMOVED,
      onFriendRemoved
    );
  }
};