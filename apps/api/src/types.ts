export type Difficulty = "easy" | "moderate" | "hard";

export type QuestionType =
  | "Multiple Choice Questions"
  | "Short Questions"
  | "Diagram/Graph-Based Questions"
  | "Numerical Problems"
  | "Case Study Questions";

export interface QuestionConfig {
  type: QuestionType;
  count: number;
  marks: number;
}

export interface CreateAssignmentInput {
  title: string;
  subject: string;
  classLevel: string;
  schoolName: string;
  dueDate: string;
  durationMinutes: number;
  questionTypes: QuestionConfig[];
  additionalInstructions?: string;
  sourceText?: string;
}

export interface GeneratedQuestion {
  id: string;
  text: string;
  difficulty: Difficulty;
  marks: number;
  type: QuestionType;
}

export interface QuestionSection {
  label: string;
  title: string;
  instruction: string;
  questions: GeneratedQuestion[];
}

export interface GeneratedPaper {
  title: string;
  subject: string;
  classLevel: string;
  schoolName: string;
  durationMinutes: number;
  maximumMarks: number;
  sections: QuestionSection[];
  answerKey: string[];
}

export interface GenerationJobData {
  assignmentId: string;
}
