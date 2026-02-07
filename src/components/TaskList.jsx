import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { taskDeleted, taskToggled, tasksCleared } from "../features/tasks/tasksSlice";
import { ui } from "../ui";

function isOverdue(dueDate) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dueDate);
  return d < today;
}

export default function TaskList() {
  const dispatch = useDispatch();
  const items = useSelector((s) => s.tasks.items);

  const [filter, setFilter] = useState("all");

  const filtered = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return items
      .slice()
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .filter((t) => {
        const d = new Date(t.dueDate);
        if (filter === "all") return true;
        if (filter === "overdue") return !t.done && isOverdue(t.dueDate);
        if (filter === "today") return d.getTime() === today.getTime();
        if (filter === "week") return d >= today && d <= weekEnd;
        return true;
      });
  }, [items, filter]);

  return (
    <div style={ui.card}>
      <div style={styles.header}>
        <div>
          <h2 style={ui.title}>Задачи</h2>
          <div style={{ ...ui.muted, fontSize: 12, marginTop: 6 }}>
            Всего: {items.length} • Активных: {items.filter((t) => !t.done).length}
          </div>
        </div>

        <div style={styles.controls}>
          <select style={ui.input} value={filter} onChange={(e) => setFilter(e.target.value)}>
            <option value="all">Все</option>
            <option value="today">Сегодня</option>
            <option value="week">Неделя</option>
            <option value="overdue">Просрочено</option>
          </select>

          <button
            style={{ ...ui.buttonGhost, ...ui.danger }}
            onClick={() => dispatch(tasksCleared())}
            disabled={items.length === 0}
            title="Удалить все задачи"
          >
            Очистить
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p style={{ ...ui.muted, marginTop: 12 }}>Пока пусто. Добавь первую задачу ✍️</p>
      ) : (
        <ul style={styles.list}>
          {filtered.map((t) => (
            <li key={t.id} style={{ ...styles.item, ...(t.done ? styles.itemDone : null) }}>
              <label style={styles.left}>
                <input type="checkbox" checked={t.done} onChange={() => dispatch(taskToggled(t.id))} />
                <div>
                  <div style={{ fontWeight: 800, textDecoration: t.done ? "line-through" : "none" }}>
                    {t.title}
                  </div>
                  <div style={{ ...ui.muted, fontSize: 12, marginTop: 4 }}>
                    {t.subject} • Дедлайн: {t.dueDate} • {t.hours}ч • сложн. {t.difficulty}
                    {!t.done && isOverdue(t.dueDate) ? (
                      <span style={{ marginLeft: 10, ...ui.badge, borderColor: "rgba(255,80,80,0.6)" }}>
                        просрочено
                      </span>
                    ) : null}
                  </div>
                </div>
              </label>

              <button style={ui.buttonGhost} onClick={() => dispatch(taskDeleted(t.id))}>
                Удалить
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const styles = {
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" },
  controls: { display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" },
  list: { listStyle: "none", padding: 0, margin: "12px 0 0 0", display: "grid", gap: 10 },
  item: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    padding: 12,
    borderRadius: 16,
    border: "1px solid var(--border)",
    background: "rgba(255,255,255,0.04)",
  },
  itemDone: { opacity: 0.8 },
  left: { display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer" },
};
