import { useEffect, useState,useRef } from "react";
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

const STATUS_META = {
  on_track: { label: "On track", variant: "success" },
  at_risk: { label: "At risk", variant: "warning" },
  critical: { label: "Critical", variant: "danger" },
};

function BranchForecastCard({ b }) {
  const meta = STATUS_META[b.status] || STATUS_META.on_track;
  const revenuePct = Math.min(b.revenue_attainment_pct || 0, 100);
  const projectedPct = Math.min(b.projected_attainment_pct || 0, 100);

  return (
    <div className="col-md-6 col-xl-4">
      <div className={`border rounded p-4 bg-white h-100 border-${meta.variant}`} style={{ borderWidth: "2px" }}>
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <div className="text-muted small text-uppercase">{b.city}</div>
            <h3 className="h5 mb-0">{b.name}</h3>
          </div>
          <span className={`badge text-bg-${meta.variant}`}>{meta.label}</span>
        </div>

        <div className="mb-3">
          <div className="d-flex justify-content-between small text-muted mb-1">
            <span>Revenue vs target</span>
            <span>{formatPct(b.revenue_attainment_pct)}</span>
          </div>
          <div className="progress" style={{ height: "8px" }}>
            <div className={`progress-bar bg-${meta.variant}`} style={{ width: `${revenuePct}%` }} />
          </div>
          <div className="d-flex justify-content-between small text-muted mt-1">
            <span>{formatInr(b.actual_revenue)}</span>
            <span>of {formatInr(b.target_revenue)}</span>
          </div>
        </div>

        <div className="row g-2 mb-3">
          <div className="col-4">
            <div className="text-muted small">Target</div>
            <div className="fw-semibold">{b.target_units}u</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Actual</div>
            <div className="fw-semibold">{b.actual_units}u</div>
          </div>
          <div className="col-4">
            <div className="text-muted small">Projected</div>
            <div className={`fw-semibold ${projectedPct < 85 ? "text-danger" : "text-success"}`}>{b.projected_units}u</div>
          </div>
        </div>

        {b.warning && (
          <div className="alert alert-danger py-2 px-3 small mb-0" role="alert">⚠ {b.warning}</div>
        )}
      </div>
    </div>
  );
}

const EMPTY_STATE = {
  period_start: "",
  period_end: "",
  days_elapsed: 0,
  days_left: 0,
  total_period_days: 0,
  branches: [],
};

function SalesForecast() {
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("all");
  const pdfRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = selectedRange === "all" ? "" : `?range=${selectedRange}`;

    fetch(`${API_URL}api/forecast${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedRange]);

  const criticalWarnings = data.branches.filter((b) => b.warning);
  const csvRows = data.branches.map((b) => ({
    Branch: b.name,
    City: b.city,
    "Target Units": b.target_units,
    "Actual Units": b.actual_units,
    "Projected Units": b.projected_units,
    "Target Revenue": b.target_revenue,
    "Actual Revenue": b.actual_revenue,
    "Projected Revenue": b.projected_revenue,
    "Attainment %": b.revenue_attainment_pct,
    Status: b.status,
    Warning: b.warning || "",
  }));
  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load latest forecast data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="mb-4">
        <h1 className="h4 mb-1">Sales Forecast</h1>
        <p className="text-muted small mb-0">
          {loading && data.branches.length === 0
            ? "Loading…"
            : `${data.period_start} to ${data.period_end} · Day ${data.days_elapsed} of ${data.total_period_days} · ${data.days_left} days left`}
        </p>
      </div>

      <TimeRangeSelector value={selectedRange} onChange={setSelectedRange} />
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <div>
          <h1 className="h4 mb-1">Sales Forecast</h1>
          <p className="text-muted small mb-0">
            {loading && data.branches.length === 0
              ? "Loading…"
              : `${data.period_start} to ${data.period_end} · Day ${data.days_elapsed} of ${data.total_period_days} · ${data.days_left} days left`}
          </p>
        </div>
        <ExportButtons
          csvData={csvRows}
          csvFilename="sales-forecast.csv"
          pdfRef={pdfRef}
          pdfFilename="sales-forecast.pdf"
          pdfTitle="Sales Forecast"
        />
      </div>
      <div ref={pdfRef}>
      {criticalWarnings.length > 0 && (
        <div className="alert alert-warning mb-4">
          <strong>{criticalWarnings.length} branch{criticalWarnings.length > 1 ? "es" : ""}</strong> need attention this period.
        </div>
      )}

      <div className="row g-4">
        {data.branches.length === 0 ? (
          <div className="col-12 text-muted text-center py-5 border rounded">
            {loading ? "Loading forecast…" : "No forecast data available."}
          </div>
        ) : (
          data.branches.map((b) => <BranchForecastCard key={b.branch_id} b={b} />)
        )}
      </div>
    </div>
    </div>
  );
}

export default SalesForecast;