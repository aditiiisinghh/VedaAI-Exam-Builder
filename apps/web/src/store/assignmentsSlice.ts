import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAssignment, deleteAssignment, fetchAssignments } from "@/lib/api";
import type { Assignment, AssignmentDraft, GeneratedPaper } from "@/lib/types";

interface AssignmentsState {
  items: Assignment[];
  selectedId?: string;
  loading: boolean;
  error?: string;
}

const initialState: AssignmentsState = {
  items: [],
  loading: false
};

export const loadAssignments = createAsyncThunk("assignments/load", fetchAssignments);
export const submitAssignment = createAsyncThunk("assignments/create", createAssignment);
export const removeAssignment = createAsyncThunk("assignments/delete", async (id: string) => {
  await deleteAssignment(id);
  return id;
});

const assignmentsSlice = createSlice({
  name: "assignments",
  initialState,
  reducers: {
    selectAssignment(state, action: PayloadAction<string | undefined>) {
      state.selectedId = action.payload;
    },
    updateGeneration(
      state,
      action: PayloadAction<{ id: string; status: Assignment["status"]; progress: number; generatedPaper?: GeneratedPaper }>
    ) {
      const assignment = state.items.find((item) => item._id === action.payload.id);
      if (!assignment) return;
      assignment.status = action.payload.status;
      assignment.progress = action.payload.progress;
      if (action.payload.generatedPaper) assignment.generatedPaper = action.payload.generatedPaper;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadAssignments.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadAssignments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.assignments;
        state.selectedId = state.selectedId ?? action.payload.assignments[0]?._id;
      })
      .addCase(loadAssignments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      })
      .addCase(submitAssignment.fulfilled, (state, action) => {
        state.items.unshift(action.payload.assignment);
        state.selectedId = action.payload.assignment._id;
      })
      .addCase(removeAssignment.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item._id !== action.payload);
        if (state.selectedId === action.payload) state.selectedId = state.items[0]?._id;
      });
  }
});

export const { selectAssignment, updateGeneration } = assignmentsSlice.actions;
export default assignmentsSlice.reducer;
