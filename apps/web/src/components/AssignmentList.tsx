"use client";

import { format } from "date-fns";
import { MoreVertical, Search, SlidersHorizontal, Trash2 } from "lucide-react";
import { removeAssignment, selectAssignment } from "@/store/assignmentsSlice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

export function AssignmentList({ onCreate }: { onCreate: () => void }) {
  const dispatch = useAppDispatch();
  const { items, selectedId, loading } = useAppSelector((state) => state.assignments);

  if (!items.length && !loading) {
    return (
      <section className="emptyState">
        <div className="emptyIllustration">
          <span />
          <strong>x</strong>
        </div>
        <h2>No assignments yet</h2>
        <p>Create your first assignment to start collecting and grading submissions. You can set rubrics, define marking criteria, and let AI assist with grading.</p>
        <button className="darkButton" onClick={onCreate}>Create Your First Assignment</button>
      </section>
    );
  }

  return (
    <section className="listPane">
      <div className="paneHeader">
        <div>
          <span className="statusDot" />
          <h1>Assignments</h1>
          <p>Manage and create assessments for your classes.</p>
        </div>
      </div>

      <div className="filterBar">
        <button><SlidersHorizontal size={15} /> Filter By</button>
        <label>
          <Search size={16} />
          <input placeholder="Search Assignment" />
        </label>
      </div>

      <div className="assignmentGrid">
        {items.map((item) => (
          <article
            className={`assignmentCard ${item._id === selectedId ? "selected" : ""}`}
            key={item._id}
            onClick={() => dispatch(selectAssignment(item._id))}
          >
            <div>
              <h3>{item.title}</h3>
              <p>
                <b>Assigned on :</b> {format(new Date(item.createdAt), "dd-MM-yyyy")}
                <span><b>Due :</b> {format(new Date(item.dueDate), "dd-MM-yyyy")}</span>
              </p>
              <small className={`statusPill ${item.status}`}>{item.status}</small>
            </div>
            <div className="cardMenu">
              <MoreVertical size={18} />
              <button
                className="deleteButton"
                onClick={(event) => {
                  event.stopPropagation();
                  dispatch(removeAssignment(item._id));
                }}
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </article>
        ))}
      </div>

      <button className="bottomCreate" onClick={onCreate}>+ Create Assignment</button>
    </section>
  );
}
