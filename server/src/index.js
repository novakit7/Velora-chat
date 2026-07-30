import "dotenv/config";
import http from "http";

import connectDB from "./db/mongoDB.db.js";
import { connectRedis } from "./db/redis.db.js";
import app from "./app.js";
import { initializeSocket } from "./sockets/index.js";

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const PORT = process.env.PORT || 3000;

    server.listen(PORT, () => {
      console.log("Server is running\n");
      console.log(` http://localhost:${PORT}\n`);
      console.log(" Socket.IO initialized\n");
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();