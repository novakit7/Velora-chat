import { Router } from "express";
import { verifyJWT } from "../middleware/Auth.middleware";

const FriendRequestRouter = Router();
FriendRequestRouter.use(verifyJWT);


export default FriendRequestRouter;