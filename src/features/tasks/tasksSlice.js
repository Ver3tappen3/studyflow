import { createSlice, nanoid } from "@reduxjs/toolkit";

const initialState = {
  items: [],
};

const tasksSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    taskAdded: {
      reducer(state, action) {
        state.items.push(action.payload);
      },
      prepare({ title, subject, dueDate, difficulty, hours }) {
        return {
          payload: {
            id: nanoid(),
            title: title.trim(),
            subject: subject.trim(),
            dueDate, // "YYYY-MM-DD"
            difficulty: Number(difficulty),
            hours: Number(hours),
            done: false,
            createdAt: Date.now(),
          },
        };
      },
    },
    taskToggled(state, action) {
      const t = state.items.find((x) => x.id === action.payload);
      if (t) t.done = !t.done;
    },
    taskDeleted(state, action) {
      state.items = state.items.filter((x) => x.id !== action.payload);
    },
    tasksCleared(state) {
      state.items = [];
    },
  },
});

export const { taskAdded, taskToggled, taskDeleted, tasksCleared } =
  tasksSlice.actions;

export default tasksSlice.reducer;
