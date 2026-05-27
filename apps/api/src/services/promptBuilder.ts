import type { CreateAssignmentInput } from "../types.js";

export function buildGenerationPrompt(input: CreateAssignmentInput) {
  const blueprint = input.questionTypes
    .map((item) => `${item.count} ${item.type}, ${item.marks} marks each`)
    .join("; ");

  return `
You are helping a teacher create a balanced school exam paper.
Return only valid JSON matching this shape:
{
  "sections": [
    {
      "label": "Section A",
      "title": "Short Answer Questions",
      "instruction": "Attempt all questions. Each question carries 2 marks.",
      "questions": [
        { "text": "...", "difficulty": "easy|moderate|hard", "marks": 2, "type": "Short Questions" }
      ]
    }
  ],
  "answerKey": ["1. concise answer", "2. concise answer"]
}

Paper context:
- Title: ${input.title}
- School: ${input.schoolName}
- Subject: ${input.subject}
- Class: ${input.classLevel}
- Duration: ${input.durationMinutes} minutes
- Blueprint: ${blueprint}
- Teacher instructions: ${input.additionalInstructions || "Keep language classroom friendly and avoid ambiguity."}
- Source material: ${input.sourceText || "Use grade-appropriate syllabus knowledge for the subject."}

Rules:
- Group questions by question type into Section A, B, C...
- Use a natural spread of easy, moderate and hard questions.
- Do not include markdown fences or extra commentary.
- Do not skip marks, type, or difficulty.
`.trim();
}
