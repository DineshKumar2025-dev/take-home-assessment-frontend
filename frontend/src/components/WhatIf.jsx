import { useEffect, useState } from "react";
import { API_URL } from "../config.js";

function formatCr(value) {
  if (value === null || value === undefined) return "—";
  return `₹${(value / 10000000).toFixed(2)} Cr`;
}

const STAGE_LABELS = {
  new: "New", contacted: "Contacted", test_drive: "Test Drive",
  negotiation: "Negotiation", order: "Order", delivered: "Delivered",
};

const EMPTY_STATE = {
  stage_reach_counts: {},
  transitions: [],
  delivered: 0,
  total_revenue: 0,
  avg_deal_value: 0,
};

// Simulates leads flowing through the funnel given a set of conversion
// rates (baseline or adjusted), returning the count that reaches the end.
function simulateFunnel(transitions, upliftByIndex) {
  if (transitions.length === 0) return 0;
  let count = transitions[0].from_count;
  transitions.forEach((t, i) => {
    const rate = Math.min((t.conversion_rate_pct || 0) + (upliftByIndex[i] || 0), 100);
    count = count * (rate / 100);
  });
  return count;
}

function WhatIf() {
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // One uplift value per transition, keyed by index, default 0
  const [uplifts, setUplifts] = useState({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}api/what-if`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => {
        setData(d);
        // Initialize all sliders at 0 once we know how many transitions exist
        const initial = {};
        (d.transitions || []).forEach((_, i) => { initial[i] = 0; });
        setUplifts(initial);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { transitions, avg_deal_value, total_revenue } = data;
  const hasData = transitions.length > 0;

  const baselineDelivered = simulateFunnel(transitions, {});
  const projectedDelivered = simulateFunnel(transitions, uplifts);
  const extraDelivered = Math.max(projectedDelivered - baselineDelivered, 0);
  const extraRevenue = extraDelivered * avg_deal_value;
  const projectedRevenue = total_revenue + extraRevenue;

  const totalUpliftPts = Object.values(uplifts).reduce((sum, v) => sum + v, 0);

  const handleSliderChange = (index, value) => {
    setUplifts((prev) => ({ ...prev, [index]: Number(value) }));
  };

  const handleReset = () => {
    const reset = {};
    transitions.forEach((_, i) => { reset[i] = 0; });
    setUplifts(reset);
  };

  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load what-if data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="mb-4">
        
        <h4 className="h4 mb-1" style={{ fontSize: "2rem" }}>What-If Simulator</h4>
        <p className="text-muted mb-0">Move the sliders to model how funnel improvements ripple through to revenue.</p>
      </div>

      <div className="row g-4">
        {/* Left: Levers */}
        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <div className="d-flex justify-content-between align-items-start mb-1">
              <div>
                <h3 className="h6 mb-1">Levers</h3>
                <p className="text-muted small mb-0">Percentage uplift on each stage-to-stage conversion</p>
              </div>
              {totalUpliftPts > 0 && (
                <button type="button" className="btn btn-sm btn-link text-muted p-0" onClick={handleReset}>
                  Reset
                </button>
              )}
            </div>

            <div className="mt-4 d-flex flex-column gap-4">
              {!hasData && (
                <div className="text-muted text-center py-5">{loading ? "Loading…" : "No funnel data available."}</div>
              )}
              {transitions.map((t, i) => (
                <div key={i}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <label className="fw-medium small">
                      {STAGE_LABELS[t.from_stage] || t.from_stage} → {STAGE_LABELS[t.to_stage] || t.to_stage} uplift
                    </label>
                    <span className="fw-bold small" style={{ fontFamily: "monospace" }}>
                      +{uplifts[i] || 0}%
                    </span>
                  </div>
                  <input
                    type="range"
                    className="form-range"
                    min={0}
                    max={100}
                    step={1}
                    value={uplifts[i] || 0}
                    onChange={(e) => handleSliderChange(i, e.target.value)}
                  />
                  <div className="text-muted" style={{ fontSize: "0.75rem" }}>
                    Baseline {t.conversion_rate_pct ?? "—"}% · {t.from_count} leads at this stage
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Projected Impact */}
        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-1">Projected impact</h3>
            <p className="text-muted small mb-4">On group revenue over the same period</p>

            <div className="row g-3 mb-4">
              <div className="col-6">
                <div className="text-uppercase text-muted small fw-semibold mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>
                  Current Revenue
                </div>
                <div className="fw-bold" style={{ fontFamily: "monospace", fontSize: "1.5rem" }}>
                  {loading ? "…" : formatCr(total_revenue)}
                </div>
              </div>
              <div className="col-6">
                <div className="text-uppercase text-muted small fw-semibold mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>
                  Projected Revenue
                </div>
                <div className="fw-bold text-success" style={{ fontFamily: "monospace", fontSize: "1.5rem" }}>
                  {loading ? "…" : formatCr(projectedRevenue)}
                </div>
              </div>
            </div>

            <div className="rounded p-3 mb-4" style={{ background: "#e6f7ee" }}>
              <div className="text-uppercase text-success small fw-semibold mb-1" style={{ fontSize: "0.7rem", letterSpacing: "0.06em" }}>
                Additional Revenue Unlocked
              </div>
              <div className="fw-bold text-success" style={{ fontFamily: "monospace", fontSize: "1.75rem" }}>
                {loading ? "…" : `+${formatCr(extraRevenue)}`}
              </div>
              <div className="text-success small mt-1">
                {totalUpliftPts > 0 ? `+${totalUpliftPts}% combined uplift` : "No uplift applied yet"}
              </div>
            </div>

            <div className="row g-3">
              <div className="col-6">
                <div className="border rounded p-3">
                  <div className="text-muted small">Baseline deliveries</div>
                  <div className="fw-semibold">{Math.round(baselineDelivered)}</div>
                </div>
              </div>
              <div className="col-6">
                <div className="border rounded p-3">
                  <div className="text-muted small">Projected deliveries</div>
                  <div className="fw-semibold text-success">{Math.round(projectedDelivered)}</div>
                </div>
              </div>
            </div>

            <div className="text-muted mt-3" style={{ fontSize: "0.75rem" }}>
              Each slider models an independent improvement at that stage; effects compound
              through every downstream stage using its current conversion rate.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatIf;