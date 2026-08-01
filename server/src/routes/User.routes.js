import { Router } from "express";
import { upload } from "../middleware/Multer.middleware.js";
import { verifyJWT } from "../middleware/Auth.middleware.js";

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
  updateProfile,
  verifyOTP,
} from "../controllers/User.controller.js";

const UserRouter = Router();

UserRouter.post("/login", signInUser);
UserRouter.post(
  "/register",
  upload.single("avatar"),
  registerUser
);

UserRouter.post("/verify", verifyOTP);

UserRouter
  .route("/forgot-password")
  .post(forgotPassword)
  .patch(resetPassword);

UserRouter.post("/refresh-token", refreshAccessToken);

// Protected Routes
UserRouter.post("/logout", verifyJWT, logOutUser);

UserRouter.post(
  "/change-password",
  verifyJWT,
  changePassword
);

UserRouter
  .route("/")
  .get(verifyJWT, getCurrentUser);

UserRouter.patch(
  "/update-profile",
  verifyJWT,
  upload.single("avatar"),
  updateProfile
);

UserRouter.get(
  "/:username",
  verifyJWT,
  getUserProfile
);

export default UserRouter;