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
import AIRoutes from "./routes/AIConversationRoutes.js";
import notificationRouter from "./routes/notification.routes.js";
import healthCheckRouter from "./routes/healthCheck.router.js";
import SearchRouter from "./routes/Search.routes.js";

//routes
app.use("/api/v1/user" ,UserRouter);
app.use("/api/v1/friend-request", FriendRequestRouter);
app.use("/api/v1/chat", chatRouter);
app.use("/api/v1/message", messageRouter);
app.use("/api/v1/ai", AIRoutes);
app.use("/api/v1/notification", notificationRouter);
app.use("/api/v1/health-check", healthCheckRouter);
app.use("/api/v1/search", SearchRouter);


app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    errors: err.errors || [],
    data: err.data || null,
  });
});

export default app;