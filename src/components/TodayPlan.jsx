import { useDispatch, useSelector } from "react-redux";
import { taskToggled } from "../features/tasks/tasksSlice";
import { generatePlanAndStore } from "../features/plan/planSlice";
import { ui } from "../ui";

function todayKey() {
  const t = new Date();
  t.setHours(0, 0, 0, 0);
  const y = t.getFullYear();
  const m = String(t.getMonth() + 1).padStart(2, "0");
  const d = String(t.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export default function TodayPlan() {
  const dispatch = useDispatch();
  const plan = useSelector((s) => s.plan.byDate);
  const tasks = useSelector((s) => s.tasks.items);

  const today = todayKey();
  const items = plan[today] || [];
  const doneById = Object.fromEntries(tasks.map((t) => [t.id, t.done]));

  const totalMinutes = items.reduce((s, x) => s + x.minutes, 0);
  const doneCount = items.filter((it) => doneById[it.id]).length;

  function toggleAndRefresh(taskId) {
    dispatch(taskToggled(taskId));
    dispatch(generatePlanAndStore({ sessionMinutes: 60, maxMinutesPerDay: 180 }));
  }

  const progress = items.length === 0 ? 0 : Math.round((doneCount / items.length) * 100);

  return (
    <div style={ui.card}>
      <div style={styles.header}>
        <div>
          <h2 style={ui.title}>Сегодня</h2>
          <div style={{ ...ui.muted, fontSize: 12, marginTop: 6 }}>
            {items.length === 0 ? "Нет пунктов на сегодня" : `Выполнено: ${doneCount}/${items.length} • ${progress}%`}
          </div>
        </div>

        <button
          style={ui.buttonGhost}
          onClick={() => dispatch(generatePlanAndStore({ sessionMinutes: 60, maxMinutesPerDay: 180 }))}
          title="Обновить план"
        >
          Обновить
        </button>
      </div>

      {items.length === 0 ? (
        <p style={{ ...ui.muted, marginTop: 12 }}>
          На сегодня ничего не запланировано ✨<br />
          Нажми «Составить план».
        </p>
      ) : (
        <>
          <div style={styles.progressWrap}>
            <div style={styles.progressBar} />
            <div style={{ ...styles.progressFill, width: `${progress}%` }} />
          </div>

          <p style={{ ...ui.muted, marginTop: 10 }}>
            Запланировано: {Math.round(totalMinutes / 60)} ч {totalMinutes % 60} мин
          </p>

          <ul style={styles.list}>
            {items.map((it, idx) => {
              const isDone = !!doneById[it.id];
              return (
                <li key={`${it.id}-${idx}`} style={styles.item}>
                  <label style={styles.row}>
                    <input type="checkbox" checked={isDone} onChange={() => toggleAndRefresh(it.id)} />
                    <div>
                      <div
                        style={{
                          fontWeight: 900,
                          textDecoration: isDone ? "line-through" : "none",
                          opacity: isDone ? 0.6 : 1,
                        }}
                      >
                        {it.title}
                      </div>
                      <div style={{ ...ui.muted, fontSize: 12, marginTop: 4 }}>
                        {it.subject} • {it.minutes} мин
                      </div>
                    </div>
                  </label>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  progressWrap: {
    position: "relative",
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 12,
  },
  progressBar: {
    position: "absolute",
    inset: 0,
    background: "rgba(255,255,255,0.08)",
    border: "1px solid var(--border)",
    borderRadius: 999,
  },
  progressFill: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
    borderRadius: 999,
  },
  list: { listStyle: "none", padding: 0, margin: "12px 0 0 0", display: "grid", gap: 8 },
  item: { border: "1px solid var(--border)", borderRadius: 16, padding: 12, background: "rgba(0,0,0,0.18)" },
  row: { display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" },
};
