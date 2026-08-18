import { useEffect, useState } from "react";
import { API_URL } from "../config.js";

function formatInr(value) {
  if (value === null || value === undefined) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

const STAGE_LABELS = {
  new: "New", contacted: "Contacted", test_drive: "Test Drive",
  negotiation: "Negotiation", order: "Order", delivered: "Delivered",
};

const STAGE_COLORS = ["#0d6efd", "#6f42c1", "#d63384", "#fd7e14", "#20c997"];

const EMPTY_STATE = {
  stage_reach_counts: {},
  transitions: [],
  delivered: 0,
  total_revenue: 0,
  avg_deal_value: 0,
};

function FunnelBar({ transitions, selectedIndex, onSelect, loading }) {
  const maxCount = Math.max(1, ...transitions.map((t) => t.from_count));

  return (
    <div className="d-flex flex-column gap-2">
      {(transitions.length === 0 ? Array.from({ length: 5 }) : transitions).map((t, i) => {
        const widthPct = t ? Math.max((t.from_count / maxCount) * 100, 8) : 0;
        const isSelected = i === selectedIndex;
        return (
          <button
            key={i}
            type="button"
            disabled={!t}
            onClick={() => t && onSelect(i)}
            className="btn text-start p-0 border-0 bg-transparent"
            style={{ opacity: t ? 1 : 0.3 }}
          >
            <div className="d-flex align-items-center gap-3">
              <div style={{ width: 130 }} className="small fw-medium text-truncate">
                {t ? `${STAGE_LABELS[t.from_stage] || t.from_stage}` : loading ? "…" : ""}
              </div>
              <div className="flex-grow-1 position-relative" style={{ height: 34 }}>
                <div
                  className="rounded"
                  style={{
                    width: `${widthPct}%`,
                    height: "100%",
                    background: isSelected ? STAGE_COLORS[i % STAGE_COLORS.length] : "#e9ecef",
                    border: isSelected ? "2px solid #212529" : "2px solid transparent",
                    transition: "all 0.2s",
                    cursor: t ? "pointer" : "default",
                  }}
                />
                <div
                  className={`position-absolute top-50 start-0 translate-middle-y ps-2 small fw-semibold ${isSelected ? "text-white" : "text-dark"}`}
                >
                  {t ? t.from_count : ""}
                </div>
              </div>
              <div style={{ width: 60 }} className="text-end small text-muted">
                {t?.conversion_rate_pct !== undefined && t?.conversion_rate_pct !== null ? `${t.conversion_rate_pct}%` : ""}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function WhatIf() {
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedIndex, setSelectedIndex] = useState(2);
  const [improvementPts, setImprovementPts] = useState(10);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}api/what-if`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { transitions, avg_deal_value, total_revenue } = data;
  const hasTransitions = transitions.length > 0;
  const safeIndex = Math.min(selectedIndex, Math.max(transitions.length - 1, 0));
  const selected = hasTransitions ? transitions[safeIndex] : null;

  const downstreamProduct = hasTransitions
    ? transitions.slice(safeIndex + 1).reduce((acc, t) => acc * ((t.conversion_rate_pct || 0) / 100), 1)
    : 1;

  let projected = null;
  if (selected && selected.conversion_rate_pct !== null) {
    const newRate = Math.min(selected.conversion_rate_pct + improvementPts, 100);
    const currentToNext = selected.from_count * (selected.conversion_rate_pct / 100);
    const newToNext = selected.from_count * (newRate / 100);
    const extraAtNextStage = newToNext - currentToNext;
    const extraDeliveries = extraAtNextStage * downstreamProduct;
    const revenueImpact = extraDeliveries * avg_deal_value;

    projected = {
      newRate,
      extraAtNextStage: Math.round(extraAtNextStage),
      extraDeliveries: Math.round(extraDeliveries * 10) / 10,
      revenueImpact,
      newTotalRevenue: total_revenue + revenueImpact,
      revenueUpliftPct: total_revenue ? (revenueImpact / total_revenue) * 100 : 0,
    };
  }

  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load what-if data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="mb-4">
        <h1 className="h4 mb-1">What-If Scenarios</h1>
        <p className="text-muted small mb-0">Pick a funnel stage, drag the slider, see the projected revenue impact.</p>
      </div>

      <div className="row g-4">
        {/* Left: funnel picker */}
        <div className="col-lg-5">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Funnel stages</h3>
            <FunnelBar
              transitions={transitions}
              selectedIndex={safeIndex}
              onSelect={setSelectedIndex}
              loading={loading}
            />
            <div className="text-muted small mt-3">Click a stage to model improving its conversion rate.</div>
          </div>
        </div>

        {/* Right: scenario controls + results */}
        <div className="col-lg-7">
          <div className="border rounded p-4 bg-white h-100" style={{ opacity: hasTransitions ? 1 : 0.5 }}>
            <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
              <h3 className="h6 mb-0">
                {selected
                  ? `${STAGE_LABELS[selected.from_stage] || selected.from_stage} → ${STAGE_LABELS[selected.to_stage] || selected.to_stage}`
                  : "Select a stage"}
              </h3>
              <span className="badge text-bg-light border">
                {selected ? `Baseline ${selected.conversion_rate_pct ?? "—"}%` : "—"}
              </span>
            </div>

            <div className="d-flex align-items-center gap-3 mb-4">
              <input
                type="range"
                className="form-range flex-grow-1"
                min={0}
                max={50}
                step={1}
                value={improvementPts}
                onChange={(e) => setImprovementPts(Number(e.target.value))}
                disabled={!hasTransitions}
              />
              <div
                className="d-flex align-items-center justify-content-center fw-bold text-white rounded-pill flex-shrink-0"
                style={{ width: 64, height: 34, background: "#198754", fontSize: "0.9rem" }}
              >
                +{improvementPts}pt
              </div>
            </div>

            {selected && (
              <div className="d-flex align-items-center gap-2 mb-4 small text-muted">
                <span className="fw-semibold text-dark">{selected.conversion_rate_pct ?? 0}%</span>
                <span style={{ flexGrow: 1, height: 2, background: "linear-gradient(to right, #adb5bd, #198754)" }} />
                <span className="fw-semibold text-success">
                  {Math.min((selected.conversion_rate_pct || 0) + improvementPts, 100)}%
                </span>
              </div>
            )}

            <div className="row g-3 mb-3">
              <div className="col-4">
                <div className="border rounded p-3 text-center">
                  <div className="text-muted small mb-1">Extra leads through</div>
                  <div className="fs-5 fw-bold">{projected ? `+${projected.extraAtNextStage}` : "—"}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="border rounded p-3 text-center">
                  <div className="text-muted small mb-1">Extra deliveries</div>
                  <div className="fs-5 fw-bold text-success">{projected ? `+${projected.extraDeliveries}` : "—"}</div>
                </div>
              </div>
              <div className="col-4">
                <div className="border rounded p-3 text-center border-success bg-success bg-opacity-10">
                  <div className="text-muted small mb-1">Revenue impact</div>
                  <div className="fs-5 fw-bold text-success">
                    {projected ? `+${formatInr(projected.revenueImpact)}` : "—"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded p-3" style={{ background: "#f8f9fa" }}>
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <span className="small text-muted">Total revenue</span>
                <span className="small">
                  {formatInr(total_revenue)}
                  {projected && (
                    <>
                      {" → "}
                      <strong className="text-success">{formatInr(projected.newTotalRevenue)}</strong>
                      {" "}
                      <span className="badge text-bg-success ms-1">+{projected.revenueUpliftPct.toFixed(1)}%</span>
                    </>
                  )}
                </span>
              </div>
              <div className="text-muted mt-2" style={{ fontSize: "0.75rem" }}>
                Assumes downstream conversion rates stay the same — extra leads convert to deliveries
                at the current historical rate, not 100%.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatIf;