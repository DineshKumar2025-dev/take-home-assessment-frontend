import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { API_URL } from "../config.js";

function formatPct(value) {
  return value === null || value === undefined ? "—" : `${value.toFixed(0)}%`;
}

function StatCard({ label, value, sub, variant }) {
  return (
    <div className="col-6 col-md-3">
      <div className="border rounded p-3 bg-white h-100">
        <div className="text-muted small text-uppercase">{label}</div>
        <div className={`fs-4 fw-semibold ${variant ? `text-${variant}` : ""}`}>{value}</div>
        {sub && <div className="text-muted small mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function onTimeVariant(pct) {
  if (pct === null || pct === undefined) return "secondary";
  if (pct >= 90) return "success";
  if (pct >= 70) return "warning";
  return "danger";
}

function DeliveryDelay() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}api/deliveries`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="d-flex align-items-center gap-2 text-muted py-5">
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading delivery data…
      </div>
    );
  }

  if (error || !data) {
    return <div className="alert alert-danger" role="alert">{error || "Couldn't load deliveries."}</div>;
  }

  const { summary, delay_reasons, branch_comparison, monthly_trend } = data;

  const pieData = [
    { name: "On time", value: summary.on_time },
    { name: "Late", value: summary.late },
  ];

  return (
    <div>
      <div className="mb-4">
        <h1 className="h4 mb-1">Delivery &amp; Delay</h1>
        <p className="text-muted small mb-0">On-time performance across {summary.total_deliveries} deliveries</p>
      </div>

      <div className="row g-3 mb-4">
        <StatCard
          label="On-time rate"
          value={formatPct(summary.on_time_pct)}
          sub={`${summary.on_time} of ${summary.total_deliveries}`}
          variant={onTimeVariant(summary.on_time_pct)}
        />
        <StatCard label="Late deliveries" value={summary.late} variant={summary.late > 0 ? "danger" : "success"} />
        <StatCard label="Avg days to deliver" value={summary.avg_days_to_deliver !== null ? `${summary.avg_days_to_deliver}d` : "—"} />
        <StatCard label="Avg days (late only)" value={summary.avg_days_late !== null ? `${summary.avg_days_late}d` : "—"} />
      </div>

      <div className="row g-4 mb-4">
        {/* On-time vs late pie */}
        <div className="col-lg-4">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">On-time vs late</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  <Cell fill="#198754" />
                  <Cell fill="#dc3545" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Delay reasons */}
        <div className="col-lg-8">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Delay reasons</h3>
            {delay_reasons.length === 0 ? (
              <div className="text-muted text-center py-5">No delays recorded.</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={delay_reasons} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="reason" fontSize={12} width={130} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc3545" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Branch comparison */}
      <div className="border rounded p-4 bg-white mb-4">
        <h3 className="h6 mb-3">Branch comparison</h3>
        <ResponsiveContainer width="100%" height={Math.max(branch_comparison.length * 50, 200)}>
          <BarChart data={branch_comparison} layout="vertical" margin={{ left: 20, right: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" fontSize={12} unit="%" />
            <YAxis type="category" dataKey="name" fontSize={13} width={110} />
            <Tooltip formatter={(val) => `${val}%`} />
            <Bar dataKey="on_time_pct" radius={[0, 6, 6, 0]} barSize={26}>
              {branch_comparison.map((b, i) => (
                <Cell
                  key={i}
                  fill={b.on_time_pct >= 90 ? "#198754" : b.on_time_pct >= 70 ? "#ffc107" : "#dc3545"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="table-responsive mt-3">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Branch</th>
                <th>City</th>
                <th className="text-end">Deliveries</th>
                <th className="text-end">On time</th>
                <th className="text-end">Late</th>
                <th className="text-end">On-time %</th>
                <th className="text-end">Avg days</th>
              </tr>
            </thead>
            <tbody>
              {branch_comparison.map((b) => (
                <tr key={b.branch_id}>
                  <td>
                    <Link to={`/branches/${b.branch_id}`} className="text-decoration-none fw-medium">
                      {b.name}
                    </Link>
                  </td>
                  <td className="text-muted">{b.city}</td>
                  <td className="text-end">{b.total_deliveries}</td>
                  <td className="text-end text-success">{b.on_time}</td>
                  <td className="text-end text-danger">{b.late}</td>
                  <td className="text-end">{formatPct(b.on_time_pct)}</td>
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

export default DeliveryDelay;