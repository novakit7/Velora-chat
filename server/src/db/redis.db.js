import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL,
});

redisClient.on("error", (err) => {
    console.error("Redis Error:", err);
});

redisClient.on("connect", () => {
    console.log("Redis connection established!!\n");
});

const connectRedis = async () => {
    try {
        await redisClient.connect();
    } catch (error) {
        console.error("Redis connection failed:", error);
        process.exit(1);
    }
};

export { redisClient, connectRedis };