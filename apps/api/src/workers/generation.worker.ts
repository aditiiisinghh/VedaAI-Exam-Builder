import { Worker } from "bullmq";
import "../config/env.js";
import { connectMongo } from "../config/db.js";
import { redisConnection } from "../config/redis.js";
import { Assignment } from "../models/Assignment.js";
import { generateQuestionPaper } from "../services/questionGenerator.js";
import { publishAssignmentEvent } from "../sockets/hub.js";
import type { GenerationJobData } from "../types.js";

async function updateProgress(assignmentId: string, progress: number, status: "generating" | "completed" | "failed") {
  await Assignment.findByIdAndUpdate(assignmentId, { progress, status });
  publishAssignmentEvent(assignmentId, { type: "progress", progress, status });
}

export async function startGenerationWorker() {
  await connectMongo();

  const worker = new Worker<GenerationJobData>(
    "question-generation",
    async (job) => {
      const { assignmentId } = job.data;
      const assignment = await Assignment.findById(assignmentId);
      if (!assignment) throw new Error("Assignment not found");

      await updateProgress(assignmentId, 28, "generating");
      await job.updateProgress(28);

      const generatedPaper = await generateQuestionPaper(assignment.toObject());
      await job.updateProgress(84);
      await Assignment.findByIdAndUpdate(assignmentId, {
        generatedPaper,
        progress: 100,
        status: "completed"
      });

      publishAssignmentEvent(assignmentId, {
        type: "completed",
        progress: 100,
        status: "completed",
        generatedPaper
      });
    },
    { connection: redisConnection }
  );

  worker.on("failed", async (job, error) => {
    const assignmentId = job?.data.assignmentId;
    if (!assignmentId) return;
    await Assignment.findByIdAndUpdate(assignmentId, {
      status: "failed",
      progress: 100,
      errorMessage: error.message
    });
    publishAssignmentEvent(assignmentId, { type: "failed", status: "failed", message: error.message });
  });

  console.log("Generation worker ready");
  return worker;
}

if (process.argv[1]?.includes("generation.worker")) {
  startGenerationWorker().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
