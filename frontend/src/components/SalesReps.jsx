import { useEffect, useState } from "react";
import { API_URL } from "../config.js";

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
  const variant = pct >= 50 ? "success" : pct >= 25 ? "warning" : "danger";
  return <span className={`badge rounded-pill text-bg-${variant}`}>{formatPct(pct)}</span>;
}

function SalesReps() {
  const [branches, setBranches] = useState([]);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [reps, setReps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load branch list once, for the dropdown
  useEffect(() => {
  fetch(`${API_URL}api/branches/list`)
    .then((res) => {
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      return res.json();
    })
    .then((data) => {
      console.log("Branches API:", data);
      setBranches(data.branches || []);
    })
    .catch((err) => {
      console.error("Failed to fetch branches:", err);
    });
}, []);

  // Load reps whenever the selected branch changes
  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = selectedBranch === "all" ? "" : `?branch_id=${selectedBranch}`;

    fetch(`${API_URL}api/sales-reps${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((data) => setReps(data.sales_reps || []))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedBranch]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center flex-wrap gap-3 mb-3">
        <div>
          <h1 className="h4 mb-1">Sales Reps</h1>
          <p className="text-muted small mb-0">Performance by representative.</p>
        </div>

        <select
          className="form-select form-select-sm w-auto"
          value={selectedBranch}
          onChange={(e) => setSelectedBranch(e.target.value)}
        >
          <option value="all">All branches</option>
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="d-flex align-items-center gap-2 text-muted py-4">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          Loading sales reps…
        </div>
      )}

      {error && (
        <div className="alert alert-danger" role="alert">
          Couldn't load sales reps: {error}
        </div>
      )}

      {!loading && !error && reps.length === 0 && (
        <div className="text-muted text-center py-5 border rounded">
          No reps found for this branch.
        </div>
      )}

      {!loading && !error && reps.length > 0 && (
        <div className="table-responsive border rounded">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Rep</th>
                <th>Branch</th>
                <th>Role</th>
                <th className="text-end">Leads</th>
                <th className="text-end">Delivered</th>
                <th className="text-end">Revenue</th>
                <th className="text-end">Conv %</th>
              </tr>
            </thead>
            <tbody>
              {reps.map((r) => (
                <tr key={r.rep_id}>
                  <td className="fw-medium">
                    <Link to={`/sales-reps/${r.rep_id}`} className="text-decoration-none fw-medium">
                      {r.name}
                    </Link>
                  </td>
                  <td className="text-muted">{r.branch_name}</td>
                  <td className="text-muted">{r.role}</td>
                  <td className="text-end">{r.total_leads}</td>
                  <td className="text-end">{r.delivered}</td>
                  <td className="text-end">{formatInr(r.revenue)}</td>
                  <td className="text-end">
                    <AttainmentBadge pct={r.conversion_rate_pct} />
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

export default SalesReps;