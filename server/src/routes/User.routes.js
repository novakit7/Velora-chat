import { Router } from "express";
import { upload } from "../middleware/Multer.middleware.js";
import { registerUser } from "../controllers/User.controller.js";
import {verifyJWT} from "../middleware/Auth.middleware.js"
const UserRouter = Router();



UserRouter.route("/register").post(upload.single("avatar"), registerUser);

export default UserRouter;