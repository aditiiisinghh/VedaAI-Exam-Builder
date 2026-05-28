"use client";

import { Calendar, FileUp, Mic, Plus, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { submitAssignment } from "@/store/assignmentsSlice";
import { useAppDispatch } from "@/store/hooks";
import type { AssignmentDraft, QuestionConfig, QuestionType } from "@/lib/types";

const questionTypeOptions: QuestionType[] = [
  "Multiple Choice Questions",
  "Short Questions",
  "Diagram/Graph-Based Questions",
  "Numerical Problems",
  "Case Study Questions"
];

const defaultQuestionTypes: QuestionConfig[] = [
  { type: "Multiple Choice Questions", count: 4, marks: 1 },
  { type: "Short Questions", count: 4, marks: 2 }
];

export function AssignmentForm({ onClose }: { onClose: () => void }) {
  const dispatch = useAppDispatch();
  const [draft, setDraft] = useState<AssignmentDraft>({
    title: "Class 8 Science Practice Paper",
    subject: "Science",
    classLevel: "8th",
    schoolName: "Delhi Public School, Sector-4, Bokaro",
    dueDate: "",
    durationMinutes: 45,
    questionTypes: defaultQuestionTypes,
    additionalInstructions: "Focus on electric current, conductors, and electrolysis. Keep the language clear for class 8 students.",
    sourceText: ""
  });
  const [error, setError] = useState("");

  const totals = useMemo(() => {
    return draft.questionTypes.reduce(
      (acc, item) => ({ questions: acc.questions + item.count, marks: acc.marks + item.count * item.marks }),
      { questions: 0, marks: 0 }
    );
  }, [draft.questionTypes]);

  const updateConfig = (index: number, patch: Partial<QuestionConfig>) => {
    setDraft((current) => ({
      ...current,
      questionTypes: current.questionTypes.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item))
    }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!draft.title || !draft.subject || !draft.classLevel || !draft.schoolName || !draft.dueDate) {
      setError("Please fill all required fields.");
      return;
    }
    if (draft.questionTypes.some((item) => item.count <= 0 || item.marks <= 0)) {
      setError("Question count and marks must be positive.");
      return;
    }

    setError("");
    await dispatch(submitAssignment(draft)).unwrap();
    onClose();
  };

  return (
    <section className="formPane">
      <div className="formTop">
        <button className="backButton" onClick={onClose} aria-label="Back"><X size={18} /></button>
        <div>
          <h1>Create Assignment</h1>
          <p>Set up a new assessment for your students</p>
        </div>
      </div>

      <form className="assignmentForm" onSubmit={submit}>
        <div className="formCard">
          <h2>Assignment Details</h2>
          <p>Basic information about your assignment</p>

          <label className="field">
            Title
            <input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} />
          </label>

          <div className="splitFields">
            <label className="field">
              Subject
              <input value={draft.subject} onChange={(event) => setDraft({ ...draft, subject: event.target.value })} />
            </label>
            <label className="field">
              Class
              <input value={draft.classLevel} onChange={(event) => setDraft({ ...draft, classLevel: event.target.value })} />
            </label>
          </div>

          <label className="uploadBox">
            <FileUp size={24} />
            <strong>{draft.material?.name ?? "Choose a file or drag & drop it here"}</strong>
            <span>PDF, TXT or pasted study notes</span>
            <input
              type="file"
              accept=".pdf,.txt,text/plain,application/pdf"
              onChange={(event) => setDraft({ ...draft, material: event.target.files?.[0] })}
            />
          </label>

          <label className="field iconField">
            Due Date
            <span>
              <input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} />
              <Calendar size={15} />
            </span>
          </label>

          <div className="questionTable">
            <div className="questionHeader">
              <b>Question Type</b>
              <b>No. Of Questions</b>
              <b>Marks</b>
            </div>
            {draft.questionTypes.map((item, index) => (
              <div className="questionRow" key={`${item.type}-${index}`}>
                <select value={item.type} onChange={(event) => updateConfig(index, { type: event.target.value as QuestionType })}>
                  {questionTypeOptions.map((option) => <option key={option}>{option}</option>)}
                </select>
                <Stepper value={item.count} onChange={(value) => updateConfig(index, { count: value })} />
                <Stepper value={item.marks} onChange={(value) => updateConfig(index, { marks: value })} />
                <button
                  type="button"
                  className="removeRow"
                  onClick={() => setDraft((current) => ({ ...current, questionTypes: current.questionTypes.filter((_, row) => row !== index) }))}
                  aria-label="Remove question type"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="addType"
              onClick={() => setDraft((current) => ({ ...current, questionTypes: [...current.questionTypes, { type: "Short Questions", count: 3, marks: 2 }] }))}
            >
              <Plus size={17} /> Add Question Type
            </button>
            <div className="totals">
              <span>Total Questions: {totals.questions}</span>
              <span>Total Marks: {totals.marks}</span>
            </div>
          </div>

          <label className="field">
            Additional Information
            <textarea
              value={draft.additionalInstructions}
              placeholder="e.g. Generate a question paper for a 3 hour exam duration..."
              onChange={(event) => setDraft({ ...draft, additionalInstructions: event.target.value })}
            />
            <Mic className="mic" size={16} />
          </label>

          <label className="field">
            Source Text
            <textarea
              value={draft.sourceText}
              placeholder="Paste notes, chapter summary, or learning outcomes for better output."
              onChange={(event) => setDraft({ ...draft, sourceText: event.target.value })}
            />
          </label>

          {error ? <p className="formError">{error}</p> : null}
        </div>

        <div className="formActions">
          <button type="button" className="lightButton" onClick={onClose}>Previous</button>
          <button type="submit" className="darkButton">Next</button>
        </div>
      </form>
    </section>
  );
}

function Stepper({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="stepper">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))}>-</button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(value + 1)}>+</button>
    </div>
  );
}
