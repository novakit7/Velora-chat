import { Router } from "express";
import { upload } from "../middleware/Multer.middleware.js";
import { registerUser, signInUser } from "../controllers/User.controller.js";
import {verifyJWT} from "../middleware/Auth.middleware.js"
const UserRouter = Router();



UserRouter.route("/register").post(upload.single("avatar"), registerUser);
UserRouter.route("/login").post(signInUser)

export default UserRouter;