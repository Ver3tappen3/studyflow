import { useDispatch, useSelector } from "react-redux";
import { generatePlanAndStore } from "../features/plan/planSlice";
import { useMemo } from "react";
import { ui } from "../ui";

function formatDay(dateKey) {
  const dt = new Date(dateKey);
  return dt.toLocaleDateString(undefined, { weekday: "short", day: "2-digit", month: "short" });
}

export default function PlanView() {
  const dispatch = useDispatch();
  const plan = useSelector((s) => s.plan.byDate);
  const tasks = useSelector((s) => s.tasks.items);

  const hasOpenTasks = tasks.some((t) => !t.done);

  const keys = useMemo(() => Object.keys(plan).sort((a, b) => a.localeCompare(b)), [plan]);

  const totalMinutes = useMemo(() => {
    let sum = 0;
    for (const k of keys) for (const it of plan[k]) sum += it.minutes;
    return sum;
  }, [keys, plan]);

  return (
    <div style={ui.card}>
      <div style={styles.header}>
        <div>
          <h2 style={ui.title}>План по дням</h2>
          <div style={{ ...ui.muted, fontSize: 12, marginTop: 6 }}>
            Лимит: 3ч/день • Сессия: 60 мин
          </div>
        </div>

        <button
          style={ui.button}
          onClick={() => dispatch(generatePlanAndStore({ sessionMinutes: 60, maxMinutesPerDay: 180 }))}
          disabled={!hasOpenTasks}
          title={!hasOpenTasks ? "Нет активных задач" : "Составить план"}
        >
          Составить план
        </button>
      </div>

      {!hasOpenTasks ? (
        <p style={{ ...ui.muted, marginTop: 12 }}>Нет активных задач. Добавь задачу и нажми «Составить план» ✍️</p>
      ) : keys.length === 0 ? (
        <p style={{ ...ui.muted, marginTop: 12 }}>Нажми «Составить план» и я разложу задачи по дням 🧠📅</p>
      ) : (
        <>
          <p style={{ ...ui.muted, marginTop: 12 }}>
            Всего запланировано: {Math.round(totalMinutes / 60)} ч ({totalMinutes} мин)
          </p>

          <div style={styles.grid}>
            {keys.slice(0, 10).map((k) => {
              const dayItems = plan[k];
              const dayMinutes = dayItems.reduce((s, x) => s + x.minutes, 0);

              return (
                <div key={k} style={{ ...ui.cardSoft, padding: 12 }}>
                  <div style={styles.dayTop}>
                    <div style={{ fontWeight: 900 }}>{formatDay(k)}</div>
                    <div style={{ ...ui.muted, fontSize: 12 }}>
                      {Math.round(dayMinutes / 60)}ч {dayMinutes % 60}м
                    </div>
                  </div>

                  <ul style={styles.list}>
                    {dayItems.map((it, idx) => (
                      <li key={`${it.id}-${idx}`} style={styles.item}>
                        <div style={{ fontWeight: 800 }}>{it.title}</div>
                        <div style={{ ...ui.muted, fontSize: 12, marginTop: 4 }}>
                          {it.subject} • {it.minutes} мин
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>

          {keys.length > 10 ? (
            <p style={{ ...ui.muted, marginTop: 12 }}>Показаны первые 10 дней. Потом добавим “весь план” 😉</p>
          ) : null}
        </>
      )}
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  grid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 },
  dayTop: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10 },
  list: { listStyle: "none", padding: 0, margin: "10px 0 0 0", display: "grid", gap: 8 },
  item: { border: "1px solid var(--border)", borderRadius: 14, padding: 10, background: "rgba(0,0,0,0.18)" },
};
