import { Router } from "express";
import { verifyJWT } from "../middleware/Auth.middleware.js";
import {
  deleteAllNotifications,
  deleteNotification,
  getNotificationById,
  getNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../controllers/Notification.controller.js";

const notificationRouter = Router();

notificationRouter.use(verifyJWT);

notificationRouter
  .route("/")
  .get(getNotifications)
  .delete(deleteAllNotifications);

notificationRouter
  .route("/:notificationId")
  .get(getNotificationById)
  .delete(deleteNotification);

notificationRouter.route("/:notificationId/read").patch(markNotificationAsRead);

notificationRouter.route("/read-all").patch(markAllNotificationsAsRead);

export default notificationRouter;
