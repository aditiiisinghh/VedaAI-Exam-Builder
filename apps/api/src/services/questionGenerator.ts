import { nanoid } from "nanoid";
import OpenAI from "openai";
import { env } from "../config/env.js";
import type { CreateAssignmentInput, GeneratedPaper, QuestionSection } from "../types.js";
import { buildGenerationPrompt } from "./promptBuilder.js";

const openai = env.openAiKey ? new OpenAI({ apiKey: env.openAiKey }) : null;

const sectionLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

function mockQuestion(type: string, index: number, subject: string, instructions?: string) {
  const topicHint = instructions?.match(/chapter|topic|electric|grammar|fraction|plant/i)?.[0] ?? subject;
  const stems: Record<string, string> = {
    "Multiple Choice Questions": `Choose the correct option for this ${subject} concept related to ${topicHint}.`,
    "Short Questions": `Explain one important idea from ${subject} related to ${topicHint}.`,
    "Diagram/Graph-Based Questions": `Draw or interpret a simple labelled diagram/graph for ${topicHint}.`,
    "Numerical Problems": `Solve a numerical problem based on ${topicHint} and show the working steps.`,
    "Case Study Questions": `Read a classroom situation about ${topicHint} and answer the connected question.`
  };

  const difficulty = index % 5 === 0 ? "hard" : index % 2 === 0 ? "moderate" : "easy";
  return { stem: stems[type] ?? `Answer a ${subject} question about ${topicHint}.`, difficulty };
}

function createMockPaper(input: CreateAssignmentInput): GeneratedPaper {
  const sections: QuestionSection[] = input.questionTypes.map((config, sectionIndex) => {
    const questions = Array.from({ length: config.count }).map((_, questionIndex) => {
      const draft = mockQuestion(config.type, questionIndex + sectionIndex, input.subject, input.additionalInstructions);
      return {
        id: nanoid(8),
        text: `${draft.stem} (${questionIndex + 1})`,
        difficulty: draft.difficulty as "easy" | "moderate" | "hard",
        marks: config.marks,
        type: config.type
      };
    });

    return {
      label: `Section ${sectionLetters[sectionIndex]}`,
      title: config.type,
      instruction: `Attempt all questions. Each question carries ${config.marks} marks.`,
      questions
    };
  });

  const answerKey = sections.flatMap((section) =>
    section.questions.map((question, index) => `${section.label}.${index + 1} Expected points for: ${question.text}`)
  );

  return {
    title: input.title,
    subject: input.subject,
    classLevel: input.classLevel,
    schoolName: input.schoolName,
    durationMinutes: input.durationMinutes,
    maximumMarks: input.questionTypes.reduce((sum, item) => sum + item.count * item.marks, 0),
    sections,
    answerKey
  };
}

function normalizePaper(input: CreateAssignmentInput, raw: { sections: QuestionSection[]; answerKey: string[] }): GeneratedPaper {
  return {
    title: input.title,
    subject: input.subject,
    classLevel: input.classLevel,
    schoolName: input.schoolName,
    durationMinutes: input.durationMinutes,
    maximumMarks: input.questionTypes.reduce((sum, item) => sum + item.count * item.marks, 0),
    sections: raw.sections.map((section, sectionIndex) => ({
      label: section.label || `Section ${sectionLetters[sectionIndex]}`,
      title: section.title,
      instruction: section.instruction,
      questions: section.questions.map((question) => ({ ...question, id: question.id || nanoid(8) }))
    })),
    answerKey: raw.answerKey ?? []
  };
}

export async function generateQuestionPaper(input: CreateAssignmentInput): Promise<GeneratedPaper> {
  if (!openai) {
    return createMockPaper(input);
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [{ role: "user", content: buildGenerationPrompt(input) }],
    response_format: { type: "json_object" }
  });

  const content = completion.choices[0]?.message.content;
  if (!content) {
    throw new Error("The AI provider returned an empty response.");
  }

  return normalizePaper(input, JSON.parse(content));
}
