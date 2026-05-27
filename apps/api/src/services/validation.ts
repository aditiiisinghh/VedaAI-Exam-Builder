import { z } from "zod";

const questionConfigSchema = z.object({
  type: z.enum([
    "Multiple Choice Questions",
    "Short Questions",
    "Diagram/Graph-Based Questions",
    "Numerical Problems",
    "Case Study Questions"
  ]),
  count: z.coerce.number().int().positive(),
  marks: z.coerce.number().int().positive()
});

export const createAssignmentSchema = z.object({
  title: z.string().trim().min(3, "Title is required"),
  subject: z.string().trim().min(2, "Subject is required"),
  classLevel: z.string().trim().min(1, "Class is required"),
  schoolName: z.string().trim().min(2, "School name is required"),
  dueDate: z.string().min(8, "Due date is required"),
  durationMinutes: z.coerce.number().int().min(15),
  questionTypes: z.array(questionConfigSchema).min(1),
  additionalInstructions: z.string().optional(),
  sourceText: z.string().optional()
});
