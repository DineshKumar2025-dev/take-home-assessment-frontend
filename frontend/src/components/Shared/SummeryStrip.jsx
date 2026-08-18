import { useEffect, useState } from "react";
import { API_URL } from "../../config.js";

const EMPTY_STATE = { total_anomalies: 0, critical_count: 0, warning_count: 0 };

export default function SummeryStrip() {
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const { total_anomalies, critical_count, warning_count } = data;

  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load anomaly summary: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}
      <div className="row g-3 mb-4">
        <div className="col-4">
          <div className="border rounded p-3 bg-white text-center">
            <div className="text-muted small">Total flags</div>
            <div className="fs-4 fw-bold">{loading ? "…" : total_anomalies}</div>
          </div>
        </div>
        <div className="col-4">
          <div className="border rounded p-3 bg-white text-center border-danger">
            <div className="text-muted small">Critical</div>
            <div className="fs-4 fw-bold text-danger">{loading ? "…" : critical_count}</div>
          </div>
        </div>
        <div className="col-4">
          <div className="border rounded p-3 bg-white text-center border-warning">
            <div className="text-muted small">Warning</div>
            <div className="fs-4 fw-bold text-warning">{loading ? "…" : warning_count}</div>
          </div>
        </div>
      </div>
    </div>
  );
}