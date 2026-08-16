import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config.js";
import TimeRangeSelector from "./TimeRangeSelector";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

const COLORS = ["#0d6efd", "#6f42c1", "#20c997", "#fd7e14", "#dc3545", "#6c757d"];

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

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const STATUS_VARIANT = {
  delivered: "success",
  lost: "danger",
  new: "secondary",
  contacted: "info",
  negotiation: "warning",
};

function StatusBadge({ status }) {
  const variant = STATUS_VARIANT[status] || "secondary";
  return <span className={`badge text-bg-${variant}`}>{status}</span>;
}

export default function SalesRepDetails() {
  const { repId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("all");

  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = selectedRange === "all" ? "" : `?range=${selectedRange}`;

    fetch(`${API_URL}api/sales-reps/${repId}${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [repId, selectedRange]);

  if (loading) {
    return (
      <div className="p-3 d-flex align-items-center gap-2 text-muted py-4">
        <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
        Loading rep…
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-3">
        <button className="btn btn-link p-0 mb-3" onClick={() => navigate(-1)}>← Back</button>
        <div className="alert alert-danger" role="alert">{error || "Sales rep not found"}</div>
      </div>
    );
  }

    const { rep, total_leads, delivered, revenue, conversion_rate_pct, monthly_trend, lead_sources, funnel, lost_reasons, leads } = data;;

  return (
    <div className="p-3">
      <button className="btn btn-link p-0 mb-3" onClick={() => navigate(-1)}>← Back</button>

      <div className="border rounded p-4 bg-white mb-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <div className="text-muted small text-uppercase">Sales Rep</div>
            <h2 className="h3 mb-0">{rep.name}</h2>
            <div className="text-muted">{rep.role} · {rep.branch_name}, {rep.city}</div>
          </div>
          <Link to="/sales-reps" className="btn btn-outline-dark btn-sm">View all reps</Link>
        </div>

        

        <div className="row g-3 mt-2">
          <div className="col-md-3">
            <div className="border rounded p-3">
              <div className="text-muted small">Total leads</div>
              <div className="fw-semibold">{total_leads}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border rounded p-3">
              <div className="text-muted small">Delivered</div>
              <div className="fw-semibold">{delivered}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border rounded p-3">
              <div className="text-muted small">Revenue</div>
              <div className="fw-semibold">{formatInr(revenue)}</div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="border rounded p-3">
              <div className="text-muted small">Conversion</div>
              <div className="fw-semibold">{formatPct(conversion_rate_pct)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded p-4 bg-white mb-4">
        <h3 className="h6 mb-3">Leads assigned</h3>
        {leads.length === 0 ? (
          <div className="text-muted text-center py-4">No leads assigned yet.</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th>
                  <th>Model</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Created</th>
                  <th>Last activity</th>
                  <th className="text-end">Deal value</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((l) => (
                  <tr key={l.lead_id}>
                    <td>{l.customer_name}</td>
                    <td className="text-muted">{l.model_interested}</td>
                    <td className="text-muted">{l.source}</td>
                    <td><StatusBadge status={l.status} /></td>
                    <td className="text-muted">{formatDate(l.created_at)}</td>
                    <td className="text-muted">{formatDate(l.last_activity_at)}</td>
                    <td className="text-end">{formatInr(l.deal_value)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
            {lead_sources.length === 0 ? (
              <div className="text-muted text-center py-5">No leads yet.</div>
            ) : (
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
            )}
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
              <div className="text-muted text-center py-5">No lost leads for this rep.</div>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={lost_reasons} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} />
                  <YAxis type="category" dataKey="reason" fontSize={12} width={110} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#dc3545" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}