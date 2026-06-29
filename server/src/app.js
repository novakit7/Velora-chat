import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// middlewares
app.use(cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true
}));
app.use(express.json({
    limit: "25kb"
}));
app.use(express.urlencoded({
    extended: true,
    limit: "25kb"
}));
app.use(express.static("public"));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is working!",
    data: req.body,
  });
});
//route decleration
import UserRouter from "./routes/User.routes.js";
import FriendRequestRouter from "./routes/FriendRequest.routes.js";
import messageRouter from "./routes/Message.routes.js";
import chatRouter from "./routes/Chat.routes.js";

//routes
app.use("/api/v1/user" ,UserRouter);
app.use("/api/v1/friend-request", FriendRequestRouter);
app.use("/api/v1/chat", chatRouter)
app.use("/api/v1/message", messageRouter)


export default app;