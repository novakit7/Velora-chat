import { Router } from "express";
import { upload } from "../middleware/Multer.middleware.js";
import {
  changePassword,
  forgotPassword,
  getCurrentUser,
  getUserProfile,
  logOutUser,
  refreshAccessToken,
  registerUser,
  resetPassword,
  signInUser,
  updateAccountDetails,
  updateUserAvatar,
  verifyOTP,
} from "../controllers/User.controller.js";
import { verifyJWT } from "../middleware/Auth.middleware.js";
const UserRouter = Router();

UserRouter.route("/login").post(signInUser);

UserRouter.route("/logout").post(verifyJWT, logOutUser);

UserRouter.route("/register").post(upload.single("avatar"), registerUser);

UserRouter.route("/verify").post(verifyOTP);

UserRouter.route("/forgot-password").post(forgotPassword).patch(resetPassword);

UserRouter.route("/change-password").post(verifyJWT, changePassword);
UserRouter.route("/")
  .get(verifyJWT, getCurrentUser)
  .patch(verifyJWT, updateAccountDetails)

UserRouter.route("/:username").get(verifyJWT, getUserProfile);

UserRouter.route("/change-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);

UserRouter.route("/refresh-token").post(refreshAccessToken);

export default UserRouter;
