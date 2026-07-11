import { Router } from "express";
import { verifyJWT } from "../middleware/Auth.middleware.js";
import { searchUsers } from "../controllers/Search.controller.js";


const SearchRouter = Router();

SearchRouter.use(verifyJWT);

SearchRouter.route("/user").get(searchUsers);
export default SearchRouter;