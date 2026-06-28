import { Router } from "express";
import { upload } from "../middleware/Multer.middleware.js";
import { logOutUser, registerUser, signInUser } from "../controllers/User.controller.js";
import {verifyJWT} from "../middleware/Auth.middleware.js"
const UserRouter = Router();

UserRouter.route("/login").post(signInUser);

UserRouter.route("/logout").post(verifyJWT, logOutUser);

UserRouter.route("/register").post(upload.single("avatar"), registerUser);

export default UserRouter;