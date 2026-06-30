import Router from "express"
import { verifyJWT } from "../middleware/Auth.middleware.js";
import { createChat, sendMessage } from "../controllers/AIconversation.controller.js";

const AIRoutes = Router();

AIRoutes.use(verifyJWT);

AIRoutes.route("/chat").post(createChat);
AIRoutes.route("/chat/:chatId/message").post(sendMessage)


export default AIRoutes;