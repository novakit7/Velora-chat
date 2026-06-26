import dotenv from "dotenv";
import connectDB from "./db/mongoDB.db.js";
import { connectRedis } from "./db/redis.db.js";
import app from "./app.js";

dotenv.config({
  path: "./.env",
});

const startServer = async () => {
  try {
    await connectDB();
    await connectRedis();

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(` Server is running`);
      console.log(`http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();