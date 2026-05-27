import { Queue } from "bullmq";
import { redisConnection } from "../config/redis.js";
import type { GenerationJobData } from "../types.js";

export const generationQueue = new Queue<GenerationJobData, void, "generate-paper">("question-generation", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: 100,
    removeOnFail: 50
  }
});
