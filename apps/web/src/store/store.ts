import { configureStore } from "@reduxjs/toolkit";
import assignmentsReducer from "./assignmentsSlice";

export const store = configureStore({
  reducer: {
    assignments: assignmentsReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
