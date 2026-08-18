import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../../config.js";
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

function LeadTabel({ selectedRange }) {
  const [data, setData] = useState({ leads: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = selectedRange === "all" ? "" : `?range=${selectedRange}`;

    fetch(`${API_URL}api/lead-aging${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => {
        setData(d);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedRange]);

  const { leads = [] } = data;
  const staleLeadsList = leads.filter((l) => l.days_stale >= 7);

  if (error) {
    return (
      <div className="alert alert-danger" role="alert">
        Couldn't load lead data: {error}
      </div>
    );
  }

  if (loading) {
    return <div className="text-muted text-center py-4">Loading…</div>;
  }

  if (staleLeadsList.length === 0) {
    return <div className="text-muted text-center py-4">No cold leads right now.</div>;
  }

  return (
    <div className="table-responsive">
      <table className="blue-table table-sm table-hover align-middle mb-0">
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
              <td className="text-muted">
                <Link to={`/sales-reps/${l.rep_id}`} className="text-decoration-none">{l.rep_name}</Link>
              </td>
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
  );
}

export default LeadTabel;