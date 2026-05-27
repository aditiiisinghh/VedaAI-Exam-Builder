import type { Assignment, AssignmentDraft } from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export async function fetchAssignments() {
  const response = await fetch(`${API_URL}/api/assignments`, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to load assignments");
  return (await response.json()) as { assignments: Assignment[] };
}

export async function createAssignment(draft: AssignmentDraft) {
  const formData = new FormData();
  formData.set("title", draft.title);
  formData.set("subject", draft.subject);
  formData.set("classLevel", draft.classLevel);
  formData.set("schoolName", draft.schoolName);
  formData.set("dueDate", draft.dueDate);
  formData.set("durationMinutes", String(draft.durationMinutes));
  formData.set("questionTypes", JSON.stringify(draft.questionTypes));
  formData.set("additionalInstructions", draft.additionalInstructions);
  formData.set("sourceText", draft.sourceText);
  if (draft.material) formData.set("material", draft.material);

  const response = await fetch(`${API_URL}/api/assignments`, {
    method: "POST",
    body: formData
  });

  if (!response.ok) {
    const error = await response.json().catch(() => null);
    throw new Error(error?.message ?? "Unable to create assignment");
  }

  return (await response.json()) as { assignment: Assignment };
}

export async function deleteAssignment(id: string) {
  const response = await fetch(`${API_URL}/api/assignments/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Unable to delete assignment");
}
