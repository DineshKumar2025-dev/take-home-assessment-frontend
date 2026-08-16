import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Components.css";
import { API_URL } from "../config.js";
import TimeRangeSelector from "./TimeRangeSelector";

function formatInr(value) {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function formatPct(value) {
  return value === null || value === undefined ? "—" : `${value.toFixed(0)}%`;
}

function AttainmentBadge({ pct }) {
  if (pct === null || pct === undefined) return <span className="text-muted">—</span>;
  const variant = pct >= 90 ? "success" : pct >= 60 ? "warning" : "danger";
  return <span className={`badge rounded-pill text-bg-${variant}`}>{formatPct(pct)}</span>;
}

function Branches() {
  const [branches, setBranches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = selectedRange === "all" ? "" : `?range=${selectedRange}`;

    fetch(`${API_URL}api/overview${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setBranches(data.branches || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedRange]);

  return (
    <div>
      <h1 className="h4 mb-3">Branches</h1>
      <p className="text-muted small">Company-wide branch performance.</p>

      <TimeRangeSelector value={selectedRange} onChange={setSelectedRange} />

      {loading && (
        <div className="d-flex align-items-center gap-2 text-muted py-4">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Loading branches…
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          Couldn't load branches: {error}
        </div>
      )}

      {!loading && !error && branches.length === 0 && (
        <div className="text-muted text-center py-5 border rounded">
          No branch data for this period.
        </div>
      )}

      {!loading && !error && branches.length > 0 && (
        <div className="table-responsive border rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Branch</th>
                <th>City</th>
                <th className="text-end">Leads</th>
                <th className="text-end">Delivered</th>
                <th className="text-end">Revenue</th>
                <th className="text-end">Conv %</th>
                <th className="text-end">Target (units)</th>
                <th className="text-end">Attain</th>
                <th className="text-end">Avg delay</th>
              </tr>
            </thead>
            <tbody>
              {branches.map((b) => (
                <tr key={b.branch_id}>
                  <td>
                    <Link to={`/branches/${b.branch_id}`} className="text-decoration-none fw-medium">
                      {b.name}
                    </Link>
                  </td>
                  <td className="text-muted">{b.city}</td>
                  <td className="text-end">{b.total_leads}</td>
                  <td className="text-end">{b.delivered}</td>
                  <td className="text-end">{formatInr(b.actual_revenue)}</td>
                  <td className="text-end">{formatPct(b.conversion_rate_pct)}</td>
                  <td className="text-end">
                    {b.actual_units}/{b.target_units}
                  </td>
                  <td className="text-end">
                    <AttainmentBadge pct={b.revenue_attainment_pct} />
                  </td>
                  <td className="text-end">
                    {b.avg_days_to_deliver !== null ? `${b.avg_days_to_deliver}d` : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default Branches;