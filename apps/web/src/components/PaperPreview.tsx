"use client";

import { Download, RefreshCcw, Sparkles } from "lucide-react";
import { downloadPaperPdf } from "@/lib/pdf";
import { submitAssignment, updateGeneration } from "@/store/assignmentsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { Assignment, Difficulty } from "@/lib/types";
import { useEffect } from "react";

const wsUrl = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:4000";

export function PaperPreview() {
  const dispatch = useAppDispatch();
  const assignment = useAppSelector((state) => state.assignments.items.find((item) => item._id === state.assignments.selectedId));

  useEffect(() => {
    if (!assignment || assignment.status === "completed" || assignment.status === "failed") return;

    const socket = new WebSocket(`${wsUrl}?assignmentId=${assignment._id}`);
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data);
      dispatch(
        updateGeneration({
          id: assignment._id,
          status: payload.status,
          progress: payload.progress ?? assignment.progress,
          generatedPaper: payload.generatedPaper
        })
      );
    };

    return () => socket.close();
  }, [assignment?._id, assignment?.status, assignment?.progress, dispatch]);

  if (!assignment) {
    return (
      <section className="previewPane placeholderPreview">
        <Sparkles size={28} />
        <h2>Select or create an assignment</h2>
        <p>Your generated question paper will appear here with sections, marks, difficulty and answer key.</p>
      </section>
    );
  }

  if (assignment.status !== "completed" || !assignment.generatedPaper) {
    return <GenerationState assignment={assignment} />;
  }

  const paper = assignment.generatedPaper;

  return (
    <section className="previewPane">
      <div className="actionBar">
        <div>
          <strong>Paper draft is ready for review.</strong>
          <span>{assignment.subject} - Class {assignment.classLevel}</span>
        </div>
        <button onClick={() => downloadPaperPdf(paper)}><Download size={16} /> Download as PDF</button>
        <button
          onClick={() =>
            dispatch(
              submitAssignment({
                title: assignment.title,
                subject: assignment.subject,
                classLevel: assignment.classLevel,
                schoolName: assignment.schoolName,
                dueDate: assignment.dueDate,
                durationMinutes: assignment.durationMinutes,
                questionTypes: assignment.questionTypes,
                additionalInstructions: assignment.additionalInstructions ?? "",
                sourceText: ""
              })
            )
          }
        >
          <RefreshCcw size={16} /> Regenerate
        </button>
      </div>

      <article className="paperSheet">
        <header className="paperHeader">
          <h1>{paper.schoolName}</h1>
          <p>Subject: {paper.subject}</p>
          <p>Class: {paper.classLevel}</p>
        </header>

        <div className="paperMeta">
          <b>Time Allowed: {paper.durationMinutes} minutes</b>
          <b>Maximum Marks: {paper.maximumMarks}</b>
        </div>

        <p className="paperInstruction">All questions are compulsory unless stated otherwise.</p>

        <div className="studentInfo">
          <label>Name:<span /></label>
          <label>Roll Number:<span /></label>
          <label>Section:<span /></label>
        </div>

        {paper.sections.map((section) => (
          <section className="paperSection" key={section.label}>
            <h2>{section.label}</h2>
            <h3>{section.title}</h3>
            <p>{section.instruction}</p>
            <ol>
              {section.questions.map((question) => (
                <li key={question.id}>
                  <span>{question.text}</span>
                  <DifficultyBadge difficulty={question.difficulty} />
                  <b>[{question.marks} Marks]</b>
                </li>
              ))}
            </ol>
          </section>
        ))}

        <strong className="endLine">End of Question Paper</strong>

        <section className="answerKey">
          <h2>Answer Key:</h2>
          <ol>
            {paper.answerKey.map((answer) => <li key={answer}>{answer}</li>)}
          </ol>
        </section>
      </article>
    </section>
  );
}

function GenerationState({ assignment }: { assignment: Assignment }) {
  return (
    <section className="previewPane generationPane">
      <div className="generationCard">
        <Sparkles size={30} />
        <h2>{assignment.status === "failed" ? "Generation needs attention" : "Generating your paper"}</h2>
        <p>
          {assignment.status === "failed"
            ? "The queue reported a failure. Check API logs or Redis/Mongo connection."
            : "The request is queued and the worker is preparing a structured paper from the blueprint."}
        </p>
        <div className="progressTrack">
          <span style={{ width: `${assignment.progress}%` }} />
        </div>
        <small>{assignment.progress}% - {assignment.status}</small>
      </div>
    </section>
  );
}

function DifficultyBadge({ difficulty }: { difficulty: Difficulty }) {
  return <em className={`difficulty ${difficulty}`}>{difficulty}</em>;
}
