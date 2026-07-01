import { Router } from "express";
import {
  deleteMessage,
  deleteMessageForEveryone,
  editMessage,
  markMessageAsRead,
  replyToMessage,
  sendAttachment,
  sendMessage,
} from "../controllers/Message.controllers.js";
import { verifyJWT } from "../middleware/Auth.middleware.js";
import { upload } from "../middleware/Multer.middleware.js";

const messageRouter = Router();

messageRouter.use(verifyJWT);

messageRouter.route("/:chatId/message").post(sendMessage);

messageRouter.route("/:messageId").patch(editMessage).delete(deleteMessage);

messageRouter.route("/:messageId/read").patch(markMessageAsRead);

messageRouter.route("/:messageId/reply").post(replyToMessage);

messageRouter.route("/:chatId/attachment").post(upload.single("file") ,sendAttachment);

messageRouter
  .route("/:messageId/delete-everyone")
  .delete(deleteMessageForEveryone);

export default messageRouter;
