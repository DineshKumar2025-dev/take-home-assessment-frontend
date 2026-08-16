import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart,
} from "recharts";
import { API_URL } from "../config.js";

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

const COLORS = ["#0d6efd", "#6f42c1", "#20c997", "#fd7e14", "#dc3545", "#6c757d"];

function StatCard({ label, value, sub, variant }) {
  return (
    <div className="col-6 col-md-4 col-xl-3">
      <div className="border rounded p-3 bg-white h-100">
        <div className="text-muted small text-uppercase">{label}</div>
        <div className={`fs-4 fw-semibold ${variant ? `text-${variant}` : ""}`}>{value}</div>
        {sub && <div className="text-muted small mt-1">{sub}</div>}
      </div>
    </div>
  );
}

function attainmentVariant(pct) {
  if (pct === null || pct === undefined) return "secondary";
  if (pct >= 90) return "success";
  if (pct >= 60) return "warning";
  return "danger";
}

function OverView() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}api/dashboard/overview`)
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
        Loading dashboard…
      </div>
    );
  }

  if (error || !data) {
    return <div className="alert alert-danger" role="alert">{error || "Couldn't load dashboard."}</div>;
  }

  const { totals, dec_target_gap, stale_leads, monthly_trend, lead_sources, lost_reasons, branch_attainment } = data;

  return (
    <div>
      <div className="mb-4">
        <h1 className="h4 mb-1">Dashboard</h1>
        <p className="text-muted small mb-0">Jun – Dec 2025 · company-wide</p>
      </div>

      {/* Vital signs */}
      <div className="row g-3 mb-4">
        <StatCard
          label="Total Revenue"
          value={formatInr(totals.total_revenue)}
          sub={`vs target ${formatInr(totals.target_revenue)}`}
        />
        <StatCard
          label="Target Attainment"
          value={formatPct(totals.revenue_attainment_pct)}
          variant={attainmentVariant(totals.revenue_attainment_pct)}
        />
        <StatCard
          label="Units Delivered"
          value={totals.units_delivered}
          sub={`target ${totals.target_units}`}
        />
        <StatCard
          label="Active Pipeline"
          value={totals.active_pipeline}
          sub="leads in progress"
        />
        <StatCard
          label="Conversion Rate"
          value={formatPct(totals.conversion_rate_pct)}
        />
        <StatCard
          label="Avg Deal Value"
          value={formatInr(totals.avg_deal_value)}
        />
        <StatCard
          label="Stale Leads"
          value={totals.stale_lead_count}
          sub="no activity 7+ days"
          variant={totals.stale_lead_count > 0 ? "danger" : "success"}
        />
        <StatCard
          label="Dec Target Gap"
          value={formatInr(dec_target_gap.revenue_gap)}
          sub={`${dec_target_gap.unit_gap} units short`}
          variant={dec_target_gap.revenue_gap > 0 ? "danger" : "success"}
        />
      </div>

      {/* Insight strip — stale leads action item */}
      {stale_leads.length > 0 && (
        <div className="alert alert-warning d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <div>
            <strong>{totals.stale_lead_count} leads</strong> haven't had activity in 7+ days.
            Oldest: <strong>{stale_leads[0].customer_name}</strong> at {stale_leads[0].branch_name}
            ({stale_leads[0].days_stale} days, assigned to {stale_leads[0].rep_name || "unassigned"}).
          </div>
        </div>
      )}

      <div className="row g-4 mb-4">
        {/* Revenue & lead trend */}
        <div className="col-lg-8">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Revenue &amp; lead trend</h3>
            <ResponsiveContainer width="100%" height={280}>
              <ComposedChart data={monthly_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis yAxisId="left" fontSize={12} />
                <YAxis yAxisId="right" orientation="right" fontSize={12} />
                <Tooltip formatter={(val, name) => name === "Revenue" ? formatInr(val) : val} />
                <Legend />
                <Bar yAxisId="left" dataKey="total_leads" fill="#0d6efd" name="Leads" radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="revenue" stroke="#dc3545" name="Revenue" strokeWidth={2} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Branch attainment comparison */}
        <div className="col-lg-4">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Branch attainment</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={branch_attainment} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" fontSize={12} unit="%" />
                <YAxis type="category" dataKey="name" fontSize={12} width={90} />
                <Tooltip formatter={(val) => `${val}%`} />
                <Bar dataKey="attainment_pct" radius={[0, 4, 4, 0]}>
                  {branch_attainment.map((b, i) => (
                    <Cell key={i} fill={b.attainment_pct >= 90 ? "#198754" : b.attainment_pct >= 60 ? "#ffc107" : "#dc3545"} />
                  ))}
                </Bar>
              </BarChart>
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
                  label={(entry) => entry.source}
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

        {/* Lost reasons */}
        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Why deals are lost</h3>
            {lost_reasons.length === 0 ? (
              <div className="text-muted text-center py-5">No lost leads recorded.</div>
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

      {/* Stale leads table */}
      {stale_leads.length > 0 && (
        <div className="border rounded p-4 bg-white mb-4">
          <h3 className="h6 mb-3">Stale leads (needs follow-up)</h3>
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th><th>Branch</th><th>Rep</th><th>Status</th>
                  <th className="text-end">Days stale</th>
                </tr>
              </thead>
              <tbody>
                {stale_leads.map((l) => (
                  <tr key={l.lead_id}>
                    <td>{l.customer_name}</td>
                    <td className="text-muted">{l.branch_name}</td>
                    <td className="text-muted">{l.rep_name || "Unassigned"}</td>
                    <td><span className="badge text-bg-secondary">{l.status}</span></td>
                    <td className="text-end text-danger fw-semibold">{l.days_stale}d</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default OverView;