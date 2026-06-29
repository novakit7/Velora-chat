import { Router } from "express";
import { verifyJWT } from "../middleware/Auth.middleware";
import {
  acceptFriendRequest,
  cancelFriendRequest,
  getFriends,
  getReceivedRequests,
  getSentRequests,
  rejectFriendRequest,
  removeFriend,
  sendFriendRequest,
} from "../controllers/FriendRequest.controller";

const FriendRequestRouter = Router();
FriendRequestRouter.use(verifyJWT);
FriendRequestRouter.route("/send/:reciverId").post(sendFriendRequest);

FriendRequestRouter.route("/accept/:requestId").patch(acceptFriendRequest);

FriendRequestRouter.route("/reject/:requestId").patch(rejectFriendRequest);

FriendRequestRouter.route("/cancel/:requestId").delete(cancelFriendRequest);

FriendRequestRouter.route("/received").get(getReceivedRequests);

FriendRequestRouter.route("/friends").get(getFriends);

FriendRequestRouter.route("/sent").get(getSentRequests);

FriendRequestRouter.route("/remove/:friendId").delete(removeFriend);

export default FriendRequestRouter;
