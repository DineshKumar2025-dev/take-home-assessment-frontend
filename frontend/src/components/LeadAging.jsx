import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { API_URL } from "../config.js";

function formatInr(value) {
  if (value === null || value === undefined) return "—";
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)}Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)}L`;
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`;
  return `₹${value}`;
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function staleBadgeVariant(days) {
  if (days >= 15) return "danger";
  if (days >= 7) return "warning";
  return "secondary";
}

const BUCKET_COLORS = { "0-3d": "#198754", "4-7d": "#ffc107", "8-14d": "#fd7e14", "15d+": "#dc3545" };

const EMPTY_STATE = {
  total_active_leads: 0,
  stale_count: 0,
  buckets: [],
  branch_breakdown: [],
  leads: [],
};

function LeadAging() {
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`${API_URL}api/lead-aging`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const { total_active_leads, stale_count, buckets, branch_breakdown, leads } = data;
  const staleLeadsList = leads.filter((l) => l.days_stale >= 7);
  const oldest = staleLeadsList[0];

  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load latest lead aging data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="mb-4">
        <h1 className="h4 mb-1">Lead Aging</h1>
        <p className="text-muted small mb-0">
          {loading ? "Loading…" : `${total_active_leads} active leads · ${stale_count} going cold (7+ days no activity)`}
        </p>
      </div>

      {oldest && (
        <div className="alert alert-warning mb-4">
          ⚠ <strong>{stale_count} leads</strong> haven't been contacted in 7+ days.
          Oldest: <strong>{oldest.customer_name}</strong> at {oldest.branch_name}
          ({oldest.days_stale} days, {oldest.rep_name}).
        </div>
      )}

      <div className="row g-4 mb-4">
        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Leads by age</h3>
            {buckets.length === 0 ? (
              <div className="text-muted text-center py-5">{loading ? "Loading…" : "No active leads."}</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={buckets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" fontSize={12} />
                  <YAxis fontSize={12} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {buckets.map((b, i) => (
                      <Cell key={i} fill={BUCKET_COLORS[b.label] || "#6c757d"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="col-lg-6">
          <div className="border rounded p-4 bg-white h-100">
            <h3 className="h6 mb-3">Stale leads by branch</h3>
            {branch_breakdown.length === 0 ? (
              <div className="text-muted text-center py-5">{loading ? "Loading…" : "No stale leads. 🎉"}</div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={branch_breakdown} layout="vertical" margin={{ left: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" fontSize={12} allowDecimals={false} />
                  <YAxis type="category" dataKey="branch_name" fontSize={12} width={100} />
                  <Tooltip />
                  <Bar dataKey="stale_count" fill="#dc3545" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="border rounded p-4 bg-white mb-4">
        <h3 className="h6 mb-3">Cold leads — need follow-up</h3>
        {staleLeadsList.length === 0 ? (
          <div className="text-muted text-center py-4">{loading ? "Loading…" : "No cold leads right now."}</div>
        ) : (
          <div className="table-responsive">
            <table className="table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th><th>Branch</th><th>Rep</th><th>Model</th>
                  <th>Last activity</th><th className="text-end">Deal value</th>
                  <th className="text-end">Days stale</th>
                </tr>
              </thead>
              <tbody>
                {staleLeadsList.map((l) => (
                  <tr key={l.lead_id}>
                    <td>{l.customer_name}</td>
                    <td className="text-muted">
                      <Link to={`/branches/${l.branch_id}`} className="text-decoration-none">{l.branch_name}</Link>
                    </td>
                    <td className="text-muted">{l.rep_name}</td>
                    <td className="text-muted">{l.model_interested}</td>
                    <td className="text-muted">{formatDate(l.last_activity_at)}</td>
                    <td className="text-end">{formatInr(l.deal_value)}</td>
                    <td className="text-end">
                      <span className={`badge text-bg-${staleBadgeVariant(l.days_stale)}`}>{l.days_stale}d</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default LeadAging;