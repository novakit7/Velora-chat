import Router from "express";
import { verifyJWT } from "../middleware/Auth.middleware.js";
import {
  checkGrammar,
  createChat,
  deleteChat,
  getChatMessages,
  getChats,
  renameChat,
  sendMessage,
  summarizeText,
  translateText,
} from "../controllers/AIConversation.controller.js";

const AIRoutes = Router();

AIRoutes.use(verifyJWT);

AIRoutes.route("/chat").post(createChat).get(getChats);

AIRoutes.route("/chat/:chatId/message").post(sendMessage);

AIRoutes.route("/chat/:chatId")
  .get(getChatMessages)
  .patch(renameChat)
  .delete(deleteChat);

AIRoutes.route("/translate").post(translateText);
AIRoutes.route("/summarize").post(summarizeText);
AIRoutes.route("/checkGrammer").post(checkGrammar);

export default AIRoutes;
