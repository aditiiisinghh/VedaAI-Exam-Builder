"use client";

import { Bell, ChevronDown, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { AssignmentForm } from "./AssignmentForm";
import { AssignmentList } from "./AssignmentList";
import { PaperPreview } from "./PaperPreview";
import { Sidebar } from "./Sidebar";
import { loadAssignments } from "@/store/assignmentsSlice";
import { useAppDispatch } from "@/store/hooks";

export function AppShell() {
  const dispatch = useAppDispatch();
  const [mode, setMode] = useState<"list" | "create">("list");

  useEffect(() => {
    dispatch(loadAssignments());
  }, [dispatch]);

  return (
    <main className="appShell">
      <Sidebar onCreate={() => setMode("create")} />
      <section className="workspace">
        <header className="topbar">
          <div className="breadcrumb">
            <button aria-label="Back">←</button>
            <span>Assignment</span>
          </div>
          <div className="topActions">
            <button aria-label="Notifications"><Bell size={18} /><span /></button>
            <div className="profile">
              <div className="miniAvatar">JD</div>
              <b>John Doe</b>
              <ChevronDown size={15} />
            </div>
            <button className="mobileMenu" aria-label="Menu"><Menu size={20} /></button>
          </div>
        </header>

        <div className="contentGrid">
          {mode === "create" ? <AssignmentForm onClose={() => setMode("list")} /> : <AssignmentList onCreate={() => setMode("create")} />}
          <PaperPreview />
        </div>
      </section>
    </main>
  );
}
