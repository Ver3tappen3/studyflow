import { useState } from "react";
import { useDispatch } from "react-redux";
import { taskAdded } from "../features/tasks/tasksSlice";
import { ui } from "../ui";

const SUBJECTS = [
  "Математика",
  "Русский язык",
  "Литература",
  "Английский язык",
  "Информатика",
  "Физика",
  "История",
  "Биология",
  "Химия",
  "География",
  "Другое",
];

export default function TaskForm() {
  const dispatch = useDispatch();

  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState(SUBJECTS[0]);
  const [dueDate, setDueDate] = useState("");
  const [difficulty, setDifficulty] = useState(3);
  const [hours, setHours] = useState(1);

  // AI state
  const [aiStatus, setAiStatus] = useState("idle"); // idle | loading | done | error
  const [aiText, setAiText] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const task = {
      id: crypto.randomUUID(),
      title,
      subject,
      dueDate,
      difficulty,
      hours,
      done: false,
    };

    // 1️⃣ Добавляем задачу
    dispatch(taskAdded(task));

    // 2️⃣ Сразу вызываем ИИ
    setAiStatus("loading");
    setAiText("");

    try {
      const res = await fetch("/.netlify/functions/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });

      if (!res.ok) {
        const t = await res.text();
        throw new Error(t || `HTTP ${res.status}`);
      }

      const data = await res.json();
      setAiText(data.text || "Нет ответа от ИИ");
      setAiStatus("done");
    } catch (err) {
      setAiStatus("error");
      setAiText(err.message || "Ошибка ИИ");
    }

    // 3️⃣ Очищаем форму
    setTitle("");
    setSubject(SUBJECTS[0]);
    setDueDate("");
    setDifficulty(3);
    setHours(1);
  }

  return (
    <form onSubmit={onSubmit} style={ui.card}>
      <h2 style={{ ...ui.title, fontSize: 20 }}>Добавить задачу</h2>

      {/* Название */}
      <label style={styles.label}>
        Название *
        <input
          style={ui.input}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например: Выучить тему"
        />
      </label>

      {/* Предмет */}
      <label style={styles.label}>
        Предмет
        <select
          style={ui.input}
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        >
          {SUBJECTS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </label>

      {/* Дедлайн */}
      <label style={styles.label}>
        Дедлайн *
        <input
          style={ui.input}
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </label>

      {/* Сложность */}
      <label style={styles.label}>
        Сложность
        <select
          style={ui.input}
          value={difficulty}
          onChange={(e) => setDifficulty(Number(e.target.value))}
        >
          {[1, 2, 3, 4, 5].map((n) => (
            <option key={n} value={n}>
              {n} / 5
            </option>
          ))}
        </select>
      </label>

      {/* Часы */}
      <label style={styles.label}>
        Сколько часов
        <select
          style={ui.input}
          value={hours}
          onChange={(e) => setHours(Number(e.target.value))}
        >
          {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
            <option key={h} value={h}>
              {h} ч
            </option>
          ))}
        </select>
      </label>

      <button style={ui.button} type="submit">
        Добавить
      </button>

      {/* AI Output */}
      {aiStatus === "loading" && (
        <p style={{ marginTop: 12, opacity: 0.8 }}>🤖 Думаю...</p>
      )}

      {aiStatus === "done" && aiText && (
        <div style={styles.aiBox}>
          <div style={styles.aiTitle}>🤖 Подсказка ИИ</div>
          <div style={styles.aiText}>{aiText}</div>
        </div>
      )}

      {aiStatus === "error" && (
        <p style={{ marginTop: 12, color: "salmon" }}>
          🤖 Ошибка: {aiText}
        </p>
      )}
    </form>
  );
}

const styles = {
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    marginTop: 12,
    color: "var(--muted)",
  },
  aiBox: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    border: "1px solid var(--border)",
    background: "rgba(255,255,255,0.05)",
  },
  aiTitle: {
    fontWeight: 900,
    marginBottom: 8,
  },
  aiText: {
    whiteSpace: "pre-wrap",
    fontSize: 14,
    lineHeight: 1.5,
  },
};
