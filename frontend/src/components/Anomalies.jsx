import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config.js";
import SummeryStrip from "./Shared/SummeryStrip";
const METRIC_LABELS = {
  conversion_rate: "Conversion Rate",
  target_attainment: "Target Attainment",
  on_time_delivery_rate: "On-Time Delivery",
  rep_lost_rate: "Rep Lost-Lead Rate",
  revenue_month_outlier: "Revenue Outlier Month",
};

const METRIC_ICONS = {
  conversion_rate: "📉",
  target_attainment: "🎯",
  on_time_delivery_rate: "🚚",
  rep_lost_rate: "⚠️",
  revenue_month_outlier: "📊",
};

function SeverityBadge({ severity }) {
  const variant = severity === "critical" ? "danger" : "warning";
  return <span className={`badge text-bg-${variant} text-uppercase`}>{severity}</span>;
}

const EMPTY_STATE = { anomalies: [] };

function AnomalyDetection() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState("all");
  const [data, setData] = useState(EMPTY_STATE);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}api/anomalies`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { anomalies } = data;
  const filtered = filter === "all" ? anomalies : anomalies.filter((a) => a.severity === filter);

  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load anomaly data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="mb-4">
        <h1 className="h4 mb-1">Anomaly Detection</h1>
        <p className="text-muted small mb-0">Branches and reps flagged as statistically off from their peers.</p>
      </div>

      <SummeryStrip />

      {!loading && anomalies.length === 0 && (
        <div className="alert alert-success mb-4">No anomalies detected — all branches and reps are within normal range.</div>
      )}

      <div className="d-flex gap-2 mb-3">
        {["all", "critical", "warning"].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={filter === f ? "btn-tab active" : "btn-tab"}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="row g-3">
        {filtered.length === 0 && !loading && anomalies.length > 0 && (
          <div className="col-12 text-muted text-center py-4">No anomalies {filter}.</div>
        )}
        {loading && anomalies.length === 0 && (
          <div className="col-12 text-muted text-center py-5">Loading…</div>
        )}
        {filtered.map((a, i) => (
          <div key={i} className="col-md-6">
            <div className={`border rounded p-3 bg-white h-100 border-${a.severity === "critical" ? "danger" : "warning"}`} style={{ borderWidth: "2px" }}>
              <div className="d-flex justify-content-between align-items-start mb-2">
                <div className="d-flex align-items-center gap-2">
                  <span style={{ fontSize: "1.3rem" }}>{METRIC_ICONS[a.metric] || "⚠️"}</span>
                  <div>
                    <div className="fw-semibold">
                      {a.rep_id ? (
                        <Link to={`/sales-reps/${a.rep_id}`} className="text-decoration-none text-dark">{a.branch_name} · Rep flag</Link>
                      ) : (
                        <Link to={`/branches/${a.branch_id}`} className="text-decoration-none text-dark">{a.branch_name}</Link>
                      )}
                    </div>
                    <div className="text-muted small">
                      {METRIC_LABELS[a.metric] || a.metric}
                      {a.month && ` · ${a.month}`}
                    </div>
                  </div>
                </div>
                <SeverityBadge severity={a.severity} />
              </div>
              <p className="mb-0 small">{a.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AnomalyDetection;