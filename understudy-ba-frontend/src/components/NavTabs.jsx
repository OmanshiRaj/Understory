import "./NavTabs.css";

const TABS = [
  { key: "digest", label: "BA Digest" },
  { key: "board", label: "Board" },
];

export default function NavTabs({ activeTab, onTabChange }) {
  return (
    <nav className="nav-tabs">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          className={`nav-tabs__btn ${activeTab === tab.key ? "nav-tabs__btn--active" : ""}`}
          onClick={() => onTabChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
