import { Router } from "express";
import { verifyJWT } from "../middleware/Auth.middleware";

const chatRouter = Router();
chatRouter.use(verifyJWT);



export default chatRouter;