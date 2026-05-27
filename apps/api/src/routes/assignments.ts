import { Router } from "express";
import multer from "multer";
import { Assignment } from "../models/Assignment.js";
import { generationQueue } from "../queues/generation.queue.js";
import { createAssignmentSchema } from "../services/validation.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 8 * 1024 * 1024 } });
export const assignmentsRouter = Router();

assignmentsRouter.get("/", async (_req, res) => {
  const assignments = await Assignment.find().sort({ createdAt: -1 }).lean();
  res.json({ assignments });
});

assignmentsRouter.get("/:id", async (req, res) => {
  const assignment = await Assignment.findById(req.params.id).lean();
  if (!assignment) {
    res.status(404).json({ message: "Assignment not found" });
    return;
  }
  res.json({ assignment });
});

assignmentsRouter.post("/", upload.single("material"), async (req, res) => {
  const body = {
    ...req.body,
    questionTypes: JSON.parse(req.body.questionTypes ?? "[]"),
    sourceText: req.body.sourceText || req.file?.buffer.toString("utf-8")
  };

  const parsed = createAssignmentSchema.safeParse(body);
  if (!parsed.success) {
    res.status(400).json({ message: "Please check the assignment fields.", issues: parsed.error.flatten() });
    return;
  }

  const assignment = await Assignment.create({
    ...parsed.data,
    fileName: req.file?.originalname,
    status: "queued",
    progress: 8
  });

  await generationQueue.add("generate-paper", { assignmentId: assignment.id });
  res.status(201).json({ assignment });
});

assignmentsRouter.delete("/:id", async (req, res) => {
  await Assignment.findByIdAndDelete(req.params.id);
  res.status(204).send();
});
