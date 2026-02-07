import { createSlice } from "@reduxjs/toolkit";

// plan = { "YYYY-MM-DD": [{ id, title, subject, minutes }] }
const initialState = {
  byDate: {},
  generatedAt: null,
};

function toDateKey(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(dateKey, n) {
  const dt = new Date(dateKey);
  dt.setDate(dt.getDate() + n);
  return toDateKey(dt);
}

function todayKey() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  return toDateKey(t);
}

// Простой, но мощный планировщик:
// - незавершённые задачи сортируем по дедлайну
// - каждую задачу дробим на сессии по 60 мин
// - распределяем от сегодня до дедлайна, максимум 3 часа в день
function generatePlan(tasks, opts = {}) {
  const sessionMinutes = opts.sessionMinutes ?? 60;
  const maxMinutesPerDay = opts.maxMinutesPerDay ?? 180;

  const start = todayKey();

  const openTasks = tasks
    .filter((t) => !t.done)
    .slice()
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const plan = {};
  const load = {}; // dateKey -> used minutes

  for (const t of openTasks) {
    const totalMinutes = Math.max(1, Number(t.hours || 1)) * 60;

    // Сколько сессий
    let left = totalMinutes;

    // Если дедлайн раньше сегодня, всё ставим на сегодня
    const end = t.dueDate < start ? start : t.dueDate;

    // Сколько дней есть (включительно)
    const startDt = new Date(start);
    const endDt = new Date(end);
    startDt.setHours(0, 0, 0, 0);
    endDt.setHours(0, 0, 0, 0);
    const days = Math.max(
      1,
      Math.floor((endDt.getTime() - startDt.getTime()) / (24 * 3600 * 1000)) + 1
    );

    // Равномерная раскладка по дням, но с лимитом нагрузки
    for (let i = 0; i < days && left > 0; i++) {
      const dateKey = addDays(start, i);

      if (!plan[dateKey]) plan[dateKey] = [];
      if (!load[dateKey]) load[dateKey] = 0;

      // пока в этот день есть место
      while (left > 0 && load[dateKey] + sessionMinutes <= maxMinutesPerDay) {
        plan[dateKey].push({
          id: t.id,
          title: t.title,
          subject: t.subject,
          minutes: Math.min(sessionMinutes, left),
        });
        load[dateKey] += sessionMinutes;
        left -= sessionMinutes;
      }
    }

    // Если не влезло, докидываем в ближайшие дни после дедлайна (чтобы план всегда строился)
    let overflowDay = days;
    while (left > 0) {
      const dateKey = addDays(start, overflowDay);
      if (!plan[dateKey]) plan[dateKey] = [];
      if (!load[dateKey]) load[dateKey] = 0;

      while (left > 0 && load[dateKey] + sessionMinutes <= maxMinutesPerDay) {
        plan[dateKey].push({
          id: t.id,
          title: t.title,
          subject: t.subject,
          minutes: Math.min(sessionMinutes, left),
        });
        load[dateKey] += sessionMinutes;
        left -= sessionMinutes;
      }
      overflowDay++;
    }
  }

  return plan;
}

const planSlice = createSlice({
  name: "plan",
  initialState,
  reducers: {
    planGenerated(state, action) {
      state.byDate = action.payload;
      state.generatedAt = Date.now();
    },
    planCleared(state) {
      state.byDate = {};
      state.generatedAt = null;
    },
  },
});

export const { planGenerated, planCleared } = planSlice.actions;

export const generatePlanAndStore = (opts) => (dispatch, getState) => {
  const tasks = getState().tasks.items;
  const plan = generatePlan(tasks, opts);
  dispatch(planGenerated(plan));
};

export default planSlice.reducer;
