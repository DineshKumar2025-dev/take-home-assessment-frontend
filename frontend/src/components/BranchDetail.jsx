import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config.js";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";
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

const COLORS = ["#0d6efd", "#6f42c1", "#20c997", "#fd7e14", "#dc3545", "#6c757d"];

export default function BranchDetail() {
  const { branchId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
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

  if (loading) {
    return (
      <div className="p-3 d-flex align-items-center gap-2 text-muted py-4">
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading branch…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-3">
        <button className="btn btn-link p-0 mb-3" onClick={() => navigate(-1)}>← Back</button>
        <div className="alert alert-danger" role="alert">{error || "Branch not found"}</div>
      </div>
    );
  }

  const { branch, sales_reps, lead_sources, monthly_trend, funnel, lost_reasons,summary } = data;

  return (
    <div className="p-3">
      <button className="btn btn-link p-0 mb-3" onClick={() => navigate(-1)}>← Back</button>

      <div className="border rounded p-4 bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="text-muted small text-uppercase">Branch</div>
            <h2 className="h3 mb-0">{branch.name}</h2>
            <div className="text-muted">{branch.city}</div>
          </div>
          <Link to="/branches" className="btn btn-outline-dark btn-sm">View all branches</Link>
        </div>
        <TimeRangeSelector value={selectedRange} onChange={setSelectedRange} />
        <div className="d-flex flex-row gap-3 flex-wrap">
          {Object.entries(summary).map(([key, value]) => (
            <div key={key} className="card p-3">
              <label className="text-muted">
                {key.replaceAll("_", " ")}
              </label>
              <h4>{value}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* Sales reps */}
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
              {sales_reps.map((r) => (
                <tr key={r.rep_id}>
                  <td>{r.name}</td>
                  <td className="text-muted">{r.role}</td>
                  <td className="text-end">{r.total_leads}</td>
                  <td className="text-end">{r.delivered}</td>
                  <td className="text-end">{formatPct(r.conversion_rate_pct)}</td>
                  <td className="text-end">{formatInr(r.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="row g-4 mb-4">
        {/* Monthly trend */}
        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Monthly trend</h3>
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
          </div>
        </div>

        {/* Lead sources */}
        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Lead sources</h3>
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={lead_sources}
                  dataKey="total_leads"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  label={({ entry, percent }) => `${entry} ${(percent * 100).toFixed(0)}%`}
                >
                  {lead_sources.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Funnel */}
        {/* <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Conversion funnel</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={funnel} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="stage" fontSize={12} width={90} />
                <Tooltip />
                <Bar dataKey="count" fill="#0d6efd" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div> */}

        {/* Lost reasons */}
        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Lost reasons</h3>
            {lost_reasons.length === 0 ? (
              <div className="text-muted text-center py-5">No lost leads in this period.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={lost_reasons}
                    dataKey="count"
                    nameKey="reason"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ reason, percent }) => `${reason} ${(percent * 100).toFixed(0)}%`}
                  >
                    {lost_reasons.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  {/* <Legend /> */}
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}