import { Router } from "express";
import { verifyJWT } from "../middleware/Auth.middleware.js";
import { upload } from "../middleware/Multer.middleware.js";
import {
    addParticipants,
  createGroupChat,
  createPrivateChat,
  deleteChat,
  deleteGroup,
  getChatById,
  getChatMessages,
  getUserChats,
  leaveGroup,
  makeAdmin,
  removeAdmin,
  removeParticipant,
  renameGroup,
  updateGroupAvatar,
} from "../controllers/Chat.controller.js";

const chatRouter = Router();
chatRouter.use(verifyJWT);

chatRouter.route("/create-chat/:userId").post(createPrivateChat);
chatRouter.route("/group").post(createGroupChat);
chatRouter.route("/").get(getUserChats);
chatRouter.route("/message/:chatId").get(getChatMessages);
chatRouter.route("/:chatId").get(getChatById);
chatRouter.route("/group/:chatId").patch(renameGroup);
chatRouter
  .route("/group/update-avatar/:chatId")
  .patch(upload.single("avatar"), updateGroupAvatar);

chatRouter.route("/group/:chatId/remove-participant/:userId").patch(removeParticipant);
chatRouter.route("/group/:chatId/add-participants").patch(addParticipants);
chatRouter.route("/group/:chatId/leave").patch(leaveGroup);
chatRouter.route("/delete/:chatId").patch(deleteChat);
chatRouter.route("/group/:chatId/make-admin/:userId").patch(makeAdmin);
chatRouter.route("/group/:chatId/remove-admin/:userId").patch(removeAdmin);
chatRouter.route("/group/:chatId/delete").delete(deleteGroup);

export default chatRouter;
