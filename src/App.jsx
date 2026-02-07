import TaskForm from "./components/TaskForm";
import TodayPlan from "./components/TodayPlan";
import TaskList from "./components/TaskList";
import PlanView from "./components/PlanView";
import { ui } from "./ui";

export default function App() {
  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <div style={styles.brandRow}>
          <div style={styles.logo}>SF</div>
          <div>
            <h1 style={styles.h1}>StudyFlow</h1>
            <p style={{ margin: 0, ...ui.muted }}>
              Focus. Plan. Finish. 🧠📅
            </p>
          </div>
        </div>

        <div style={styles.chips}>
          <span style={ui.badge}>PWA ready</span>
          <span style={ui.badge}>Redux</span>
          <span style={ui.badge}>Smart planning</span>
        </div>
      </header>

      <main style={styles.grid}>
        <TaskForm />
        <TodayPlan />
        <TaskList />
        <PlanView />
      </main>

      <footer style={styles.footer}>
        v0.3 • Данные сохраняются в браузере (localStorage)
      </footer>
    </div>
  );
}

const styles = {
  page: { maxWidth: 980, margin: "0 auto", padding: 16 },
  header: { padding: "10px 0 18px 0" },
  brandRow: { display: "flex", gap: 12, alignItems: "center" },
  logo: {
    width: 44,
    height: 44,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    color: "#0b0d12",
    background: "linear-gradient(135deg, var(--accent), var(--accent2))",
  },
  h1: { margin: 0, fontSize: 28, letterSpacing: 0.2 },
  chips: { display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 },
  grid: { display: "grid", gridTemplateColumns: "1fr", gap: 16 },
  footer: { opacity: 0.75, fontSize: 12, paddingTop: 16, color: "var(--muted)" },
};
