import { useState, useEffect, useCallback, useRef } from "react";
import NavTabs from "./components/NavTabs.jsx";
import Header from "./components/Header.jsx";
import SentimentSummary from "./components/SentimentSummary.jsx";
import ThemeList from "./components/ThemeList.jsx";
import SpikeAlerts from "./components/SpikeAlerts.jsx";
import PmMiniPanel from "./components/PmMiniPanel.jsx";
import BaMiniPanel from "./components/BaMiniPanel.jsx";
import TicketBoard from "./components/TicketBoard.jsx";
import TicketDetailModal from "./components/TicketDetailModal.jsx";
import "./App.css";

const BA_API = "http://localhost:3002/api/ba-digest";
const UNIFIED_API = "http://localhost:3002/api/unified-digest";

/* ═══════════════════════════════════════════════════════════
   BA Digest Tab
   ═══════════════════════════════════════════════════════════ */
function BaDigestView({ digest, loading, error, onRefresh }) {
  return (
    <>
      <Header
        date={digest?.date ?? "—"}
        run_type={digest?.run_type ?? "explored"}
        onRefresh={onRefresh}
      />
      <div className="app__content">
        {loading && (
          <div className="app__loading">
            <div className="app__spinner" />
            <span className="app__loading-text">Loading digest...</span>
          </div>
        )}
        {error && !loading && (
          <div className="app__error">
            <span className="app__error-text">{error}</span>
            <button className="app__retry-btn" onClick={onRefresh}>
              Retry
            </button>
          </div>
        )}
        {!loading && !error && digest && (
          <>
            <div className="app__sentiment-row">
              <SentimentSummary {...digest.sentiment_summary} />
            </div>
            <div className="app__two-col">
              <ThemeList themes={digest.themes} />
              <SpikeAlerts spikes={digest.spikes} />
            </div>
          </>
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Board Tab
   ═══════════════════════════════════════════════════════════ */
function BoardView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [actionError, setActionError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const fetchedRef = useRef(false);

  const fetchUnified = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(UNIFIED_API);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError(err.message || "Failed to fetch unified digest");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchUnified();
  }, [fetchUnified]);

  const handleTicketAction = async (id, action) => {
    setActionError(null);
    setSuccessMsg("");
    try {
      const res = await fetch(
        `http://localhost:3002/api/candidate-tickets/${id}/${action}`,
        { method: "POST" }
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Action failed (${res.status})`);
      }
      setSuccessMsg(`Ticket ${action}d successfully`);
      setSelectedTicket(null);
      await fetchUnified();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <>
      <Header
        date={data?.generated_at ? new Date(data.generated_at).toLocaleDateString() : "—"}
        run_type="board"
        onRefresh={fetchUnified}
      />
      <div className="app__content">
        {loading && (
          <div className="app__loading">
            <div className="app__spinner" />
            <span className="app__loading-text">Loading board...</span>
          </div>
        )}
        {error && !loading && (
          <div className="app__error">
            <span className="app__error-text">{error}</span>
            <button className="app__retry-btn" onClick={fetchUnified}>
              Retry
            </button>
          </div>
        )}
        {successMsg && (
          <div className="app__success">{successMsg}</div>
        )}
        {!loading && !error && data && (
          <>
            <div className="app__two-col">
              <PmMiniPanel pm={data.pm} pm_error={data.pm_error} />
              <BaMiniPanel ba={data.ba} />
            </div>
            <TicketBoard
              tickets={data.candidate_tickets || []}
              onTicketClick={(t) => {
                setSelectedTicket(t);
                setActionError(null);
                setSuccessMsg("");
              }}
            />
          </>
        )}
        {selectedTicket && (
          <TicketDetailModal
            ticket={selectedTicket}
            onClose={() => setSelectedTicket(null)}
            onApprove={(id) => handleTicketAction(id, "approve")}
            onReject={(id) => handleTicketAction(id, "reject")}
            actionError={actionError}
          />
        )}
      </div>
    </>
  );
}

/* ═══════════════════════════════════════════════════════════
   Root App with tab switching
   ═══════════════════════════════════════════════════════════ */
function App() {
  const [activeTab, setActiveTab] = useState("digest");

  return (
    <>
      <NavTabs activeTab={activeTab} onTabChange={setActiveTab} />
      {activeTab === "digest" ? <BaDigestTab /> : <BoardView />}
    </>
  );
}

/* ── BA Digest tab with its own state ──────────────────── */
function BaDigestTab() {
  const [digest, setDigest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchedRef = useRef(false);

  const fetchDigest = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(BA_API);
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const data = await res.json();
      setDigest(data);
    } catch (err) {
      setError(err.message || "Failed to fetch digest");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchDigest();
  }, [fetchDigest]);

  return (
    <BaDigestView
      digest={digest}
      loading={loading}
      error={error}
      onRefresh={fetchDigest}
    />
  );
}

export default App;