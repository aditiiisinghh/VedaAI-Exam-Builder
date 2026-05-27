import jsPDF from "jspdf";
import type { GeneratedPaper } from "./types";

export function downloadPaperPdf(paper: GeneratedPaper) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 48;
  let y = 52;

  const write = (text: string, size = 10, bold = false) => {
    doc.setFont("times", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, 500);
    lines.forEach((line: string) => {
      if (y > 770) {
        doc.addPage();
        y = 52;
      }
      doc.text(line, margin, y);
      y += size + 7;
    });
  };

  doc.setFont("times", "bold");
  doc.setFontSize(16);
  doc.text(paper.schoolName, 297, y, { align: "center" });
  y += 24;
  doc.setFontSize(12);
  doc.text(`Subject: ${paper.subject}`, 297, y, { align: "center" });
  y += 18;
  doc.text(`Class: ${paper.classLevel}`, 297, y, { align: "center" });
  y += 32;

  write(`Time Allowed: ${paper.durationMinutes} minutes`, 10, true);
  write(`Maximum Marks: ${paper.maximumMarks}`, 10, true);
  y += 12;
  write("Name: ____________________    Roll Number: ____________________    Section: ____________________", 10);
  y += 20;

  paper.sections.forEach((section) => {
    write(section.label, 12, true);
    write(section.title, 11, true);
    write(section.instruction, 9);
    section.questions.forEach((question, index) => {
      write(`${index + 1}. [${question.difficulty}] ${question.text} [${question.marks} Marks]`, 10);
    });
    y += 12;
  });

  write("Answer Key", 12, true);
  paper.answerKey.forEach((answer) => write(answer, 9));

  doc.save(`${paper.title.replace(/\s+/g, "-").toLowerCase()}-paper.pdf`);
}
