import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import "./Components.css";
import { API_URL } from "../config.js";
import TimeRangeSelector from "./TimeRangeSelector";
import ExportButtons from "./ExportButtons";

function formatInr(value) {
  if (value === null || value === undefined) return "—";
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

const EMPTY_STATE = { branches: [] };

function Branches() {
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("all");
  const pdfRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = selectedRange === "all" ? "" : `?range=${selectedRange}`;

    fetch(`${API_URL}api/overview${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData({ branches: d.branches || [] }))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedRange]);

  const { branches } = data;

  const csvRows = branches.map((b) => ({
    Branch: b.name,
    City: b.city,
    Leads: b.total_leads,
    Delivered: b.delivered,
    Revenue: b.actual_revenue,
    "Conversion %": b.conversion_rate_pct,
    "Actual Units": b.actual_units,
    "Target Units": b.target_units,
    "Attainment %": b.revenue_attainment_pct,
    "Avg Days To Deliver": b.avg_days_to_deliver,
  }));

  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load latest branch data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
        <div>
          <h1 className="h4 mb-3">Branches</h1>
          <p className="text-muted small">Company-wide branch performance.</p>
        </div>
        <ExportButtons
          csvData={csvRows}
          csvFilename={`branches-${selectedRange}.csv`}
          pdfRef={pdfRef}
          pdfFilename={`branches-${selectedRange}.pdf`}
          pdfTitle="Branch Performance"
        />
      </div>

      <TimeRangeSelector value={selectedRange} onChange={setSelectedRange} />

      <div ref={pdfRef}>
        <div className="table-responsive border rounded" style={{ opacity: loading ? 0.6 : 1, transition: "opacity 0.2s" }}>
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
              {branches.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-muted text-center py-5">
                    {loading ? "Loading branches…" : "No branch data for this period."}
                  </td>
                </tr>
              )}
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
                  <td className="text-end">{b.actual_units}/{b.target_units}</td>
                  <td className="text-end"><AttainmentBadge pct={b.revenue_attainment_pct} /></td>
                  <td className="text-end">{b.avg_days_to_deliver !== null ? `${b.avg_days_to_deliver}d` : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Branches;