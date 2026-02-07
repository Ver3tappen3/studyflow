import { configureStore } from "@reduxjs/toolkit";
import tasksReducer from "../features/tasks/tasksSlice";
import planReducer from "../features/plan/planSlice";


function loadState() {
  try {
    const raw = localStorage.getItem("studyflow_state");
    return raw ? JSON.parse(raw) : undefined;
  } catch {
    return undefined;
  }
}

function saveState(state) {
  try {
    localStorage.setItem("studyflow_state", JSON.stringify(state));
  } catch {
    // ignore
  }
}

export const store = configureStore({
  reducer: {
    tasks: tasksReducer,
    plan: planReducer,
  },
  preloadedState: loadState(),
});

store.subscribe(() => {
    saveState({
  tasks: store.getState().tasks,
  plan: store.getState().plan,
});
});
