import mongoose, { Schema } from "mongoose";
import type { CreateAssignmentInput, GeneratedPaper } from "../types.js";

export type AssignmentStatus = "draft" | "queued" | "generating" | "completed" | "failed";

export interface AssignmentDocument extends CreateAssignmentInput {
  status: AssignmentStatus;
  progress: number;
  generatedPaper?: GeneratedPaper;
  errorMessage?: string;
  fileName?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionConfigSchema = new Schema(
  {
    type: { type: String, required: true },
    count: { type: Number, required: true, min: 1 },
    marks: { type: Number, required: true, min: 1 }
  },
  { _id: false }
);

const GeneratedQuestionSchema = new Schema(
  {
    id: String,
    text: String,
    difficulty: String,
    marks: Number,
    type: String
  },
  { _id: false }
);

const QuestionSectionSchema = new Schema(
  {
    label: String,
    title: String,
    instruction: String,
    questions: [GeneratedQuestionSchema]
  },
  { _id: false }
);

const GeneratedPaperSchema = new Schema(
  {
    title: String,
    subject: String,
    classLevel: String,
    schoolName: String,
    durationMinutes: Number,
    maximumMarks: Number,
    sections: [QuestionSectionSchema],
    answerKey: [String]
  },
  { _id: false }
);

const AssignmentSchema = new Schema<AssignmentDocument>(
  {
    title: { type: String, required: true },
    subject: { type: String, required: true },
    classLevel: { type: String, required: true },
    schoolName: { type: String, required: true },
    dueDate: { type: String, required: true },
    durationMinutes: { type: Number, required: true, min: 15 },
    questionTypes: { type: [QuestionConfigSchema], required: true },
    additionalInstructions: String,
    sourceText: String,
    fileName: String,
    status: { type: String, default: "draft", index: true },
    progress: { type: Number, default: 0 },
    generatedPaper: GeneratedPaperSchema,
    errorMessage: String
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<AssignmentDocument>("Assignment", AssignmentSchema);
