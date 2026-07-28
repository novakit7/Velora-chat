import { Router } from "express";
import { verifyJWT } from "../middleware/Auth.middleware.js";

import {
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  cancelFriendRequest,
  getReceivedRequests,
  getSentRequests,
} from "../controllers/FriendRequest.controller.js";

const FriendRequestRouter = Router();

FriendRequestRouter.use(verifyJWT);

FriendRequestRouter.post(
  "/send/:receiverId",
  sendFriendRequest
);

FriendRequestRouter.get(
  "/received",
  getReceivedRequests
);

FriendRequestRouter.get(
  "/sent",
  getSentRequests
);

FriendRequestRouter.patch(
  "/accept/:requestId",
  acceptFriendRequest
);

FriendRequestRouter.delete(
  "/reject/:requestId",
  rejectFriendRequest
);

FriendRequestRouter.delete(
  "/cancel/:requestId",
  cancelFriendRequest
);

export default FriendRequestRouter;