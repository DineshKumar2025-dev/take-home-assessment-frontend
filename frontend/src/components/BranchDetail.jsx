import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config.js";
import {
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
import TimeRangeSelector from "./TimeRangeSelector";

function formatInr(value) {
  if (value === null || value === undefined) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

const COLORS = ["#0d6efd", "#6f42c1", "#20c997", "#fd7e14", "#dc3545", "#6c757d"];

const EMPTY_STATE = {
  branch: { name: "", city: "", branch_id: "" },
  summary: {},
  sales_reps: [],
  lead_sources: [],
  monthly_trend: [],
  funnel: [],
  lost_reasons: [],
};

export default function BranchDetail() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = selectedRange === "all" ? "" : `?range=${selectedRange}`;

    fetch(`${API_URL}api/branches/${branchId}${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [branchId, selectedRange]);

  const { branch, sales_reps, lead_sources, monthly_trend, lost_reasons, summary } = data;

  return (
    <div className="p-3">
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load latest branch data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <button className="btn btn-link p-0 mb-3" onClick={() => navigate(-1)}>← Back</button>

      <div className="border rounded p-4 bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="text-muted small text-uppercase">Branch</div>
            <h2 className="h3 mb-0">{branch.name || (loading ? "Loading…" : "—")}</h2>
            <div className="text-muted">{branch.city || ""}</div>
          </div>
          <Link to="/branches" className="btn btn-outline-dark btn-sm">View all branches</Link>
        </div>
        <TimeRangeSelector value={selectedRange} onChange={setSelectedRange} />
        <div className="d-flex flex-row gap-3 flex-wrap">
          {Object.entries(summary).length === 0 && !loading ? null : Object.entries(summary).map(([key, value]) => (
            <div key={key} className="card p-3">
              <label className="text-muted">{key.replaceAll("_", " ")}</label>
              <h4>{value ?? "—"}</h4>
            </div>
          ))}
        </div>
      </div>

      <div className="border rounded p-4 bg-white mb-4">
        <h3 className="h6 mb-3">Sales reps</h3>
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Name</th><th>Role</th>
                <th className="text-end">Leads</th>
                <th className="text-end">Delivered</th>
                <th className="text-end">Conv %</th>
                <th className="text-end">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {sales_reps.length === 0 && (
                <tr><td colSpan={6} className="text-muted text-center py-4">{loading ? "Loading…" : "No reps found."}</td></tr>
              )}
              {sales_reps.map((r) => (
                <tr key={r.rep_id}>
                  <td>{r.name}</td>
                  <td className="text-muted">{r.role}</td>
                  <td className="text-end">{r.total_leads}</td>
                  <td className="text-end">{r.delivered}</td>
                  <td className="text-end">{r.conversion_rate_pct ?? "—"}%</td>
                  <td className="text-end">{formatInr(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Monthly trend</h3>
            {monthly_trend.length === 0 ? (
              <div className="text-muted text-center py-5">{loading ? "Loading…" : "No data yet."}</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="total_leads" stroke="#0d6efd" name="Leads" />
                  <Line type="monotone" dataKey="delivered" stroke="#20c997" name="Delivered" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Lead sources</h3>
            {lead_sources.length === 0 ? (
              <div className="text-muted text-center py-5">{loading ? "Loading…" : "No leads yet."}</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={lead_sources} dataKey="total_leads" nameKey="source"
                    cx="50%" cy="50%" outerRadius={90}
                    label={(entry) => entry.source}
                  >
                    {lead_sources.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Lost reasons</h3>
            {lost_reasons.length === 0 ? (
              <div className="text-muted text-center py-5">{loading ? "Loading…" : "No lost leads in this period."}</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={lost_reasons} dataKey="count" nameKey="reason"
                    cx="50%" cy="50%" outerRadius={90}
                    label={({ reason, percent }) => `${reason} ${(percent * 100).toFixed(0)}%`}
                  >
                    {lost_reasons.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}