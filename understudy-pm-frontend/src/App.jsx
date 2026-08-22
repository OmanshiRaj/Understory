import Header from "./components/Header";
import StandupCard from "./components/StandupCard";
import OverdueCard from "./components/OverdueCard";
import StaleCard from "./components/StaleCard";
import BlockedCard from "./components/BlockedCard";
import WorkloadChart from "./components/WorkloadChart";

const mockDigest = {
  date: "2026-08-21",
  moved: [{ title: "Fix login bug", from: "In Progress", to: "Done" }],
  overdue: [
    { title: "Write API docs", due_date: "2026-08-19", assignee: "Alex" },
  ],
  stale: [
    { title: "Design landing page", days_since_update: 7, assignee: "Priya" },
  ],
  blocked: [
    {
      title: "Design landing page",
      reason: "waiting on review",
      assignee: "Priya",
    },
  ],
  workload_per_assignee: [
    { assignee: "Alex", open_cards: 6 },
    { assignee: "Priya", open_cards: 1 },
  ],
  run_type: "explored",
};

function App() {
  const digest = mockDigest;

  return (
    <>
      <Header
        date={digest.date}
        runType={digest.run_type}
        onRefresh={() => {}}
      />
      <StandupCard moved={digest.moved} />
      <div className="status-grid">
        <OverdueCard items={digest.overdue} />
        <StaleCard items={digest.stale} />
        <BlockedCard items={digest.blocked} />
      </div>
      <WorkloadChart data={digest.workload_per_assignee} />
    </>
  );
}

export default App;
