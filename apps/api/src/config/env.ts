import dotenv from "dotenv";

dotenv.config();

export const env = {
  port: Number(process.env.PORT ?? 4000),
  mongoUri: process.env.MONGODB_URI ?? "mongodb://127.0.0.1:27017/vedaai-assessment",
  redisUrl: process.env.REDIS_URL ?? "redis://127.0.0.1:6379",
  openAiKey: process.env.OPENAI_API_KEY,
  clientUrl: process.env.CLIENT_URL ?? "http://localhost:3000"
};
