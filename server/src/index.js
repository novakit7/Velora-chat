import dotenv from "dotenv";
import connectDB from "./db/mongoDB.db.js";
import { connectRedis } from "./db/redis.db.js";
import app from "./app.js";
import { Server } from "socket.io";
import { initializeSocket } from "./sockets/index.js";
import http from "http";

dotenv.config({
  path: "./.env",
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

initializeSocket(io);

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
      console.log(`socket is connected!!\n Server is running`);
      console.log(`\nhttp://localhost:${PORT}\n`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
