import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../config.js";
import TimeRangeSelector from "./TimeRangeSelector";
import ExportButtons from "./ExportButtons";
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
  delivered: "success", lost: "danger", new: "secondary", contacted: "info", negotiation: "warning",
};

function StatusBadge({ status }) {
  const variant = STATUS_VARIANT[status] || "secondary";
  return <span className={`badge text-bg-${variant}`}>{status}</span>;
}

const EMPTY_STATE = {
  rep: { name: "", role: "", branch_name: "", city: "" },
  total_leads: 0,
  delivered: 0,
  revenue: 0,
  conversion_rate_pct: null,
  monthly_trend: [],
  lead_sources: [],
  funnel: [],
  lost_reasons: [],
  leads: [],
};

export default function SalesRepDetails() {
  const { repId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("all");
  const pdfRef = useRef(null);

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

  const { rep, total_leads, delivered, revenue, conversion_rate_pct, monthly_trend, lead_sources, lost_reasons, leads } = data;

  const csvRows = leads.map((l) => ({
    Customer: l.customer_name,
    Model: l.model_interested,
    Source: l.source,
    Status: l.status,
    Created: l.created_at,
    "Last Activity": l.last_activity_at,
    "Deal Value": l.deal_value,
  }));

  return (
    <div className="p-3">
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load latest rep data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <button className="btn-nav" onClick={() => navigate(-1)}>← Back</button>
        <ExportButtons
          csvData={csvRows}
          csvFilename={`rep-${repId}-leads-${selectedRange}.csv`}
          pdfRef={pdfRef}
          pdfFilename={`rep-${repId}-${selectedRange}.pdf`}
          pdfTitle={rep.name ? `${rep.name} — Performance Report` : "Sales Rep Report"}
        />
      </div>

      <div ref={pdfRef}>
        <div className="border rounded p-4 bg-white mb-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-3">
            <div>
              <div className="text-muted small text-uppercase">Sales Rep</div>
              <h2 className="h3 mb-0">{rep.name || (loading ? "Loading…" : "—")}</h2>
              <div className="text-muted">{rep.role} {rep.branch_name && `· ${rep.branch_name}, ${rep.city}`}</div>
            </div>
            <Link to="/sales-reps" className="btn-nav">View all reps</Link>
          </div>

          <TimeRangeSelector value={selectedRange} onChange={setSelectedRange} />

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
          <div className="table-responsive">
            <table className="blue-table">
              <thead className="">
                <tr>
                  <th>Customer</th><th>Model</th><th>Source</th><th>Status</th>
                  <th>Created</th><th>Last activity</th><th className="text-end">Deal value</th>
                </tr>
              </thead>
              <tbody>
                {leads.length === 0 && (
                  <tr><td colSpan={7} className="text-muted text-center py-4">{loading ? "Loading…" : "No leads assigned yet."}</td></tr>
                )}
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
                      label={({ entry, percent }) => `${entry} ${(percent * 100).toFixed(0)}%`}
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
                <div className="text-muted text-center py-5">{loading ? "Loading…" : "No lost leads for this rep."}</div>
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
    </div>
  );
}