import { useEffect, useState,useRef } from "react";
import { Link } from "react-router-dom";
import { API_URL } from "../config.js";
function LeadTable({selectedRange}){
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      useEffect(() => {
        setLoading(true);
        setError(null);
    
        fetch(`${API_URL}api/lead-aging${query}`)
          .then((res) => {
            if (!res.ok) throw new Error(`Request failed: ${res.status}`);
            return res.json();
          })
          .then((d) => {
            console.log(d);
            setData(d)
          })
          .catch((err) => setError(err.message))
          .finally(() => setLoading(false));
      }, [selectedRange]);
        const staleLeadsList = leads.filter((l) => l.days_stale >= 7);
  const oldest = staleLeadsList[0];
  const csvRows = staleLeadsList.map((l) => ({
    Customer: l.customer_name,
    Branch: l.branch_name,
    Rep: l.rep_name,
    Model: l.model_interested,
    "Last Activity": l.last_activity_at,
    "Deal Value": l.deal_value,
    "Days Stale": l.days_stale,
  }));
    return(

        <>
        <div className="border rounded p-4 bg-white mb-4">
        <h3 className="h6 mb-3">Cold leads — need follow-up</h3>
        {staleLeadsList.length === 0 ? (
          <div className="text-muted text-center py-4">{loading ? "Loading…" : "No cold leads right now."}</div>
        ) : (
          <div className="table-responsive">
            <table className="blue-table table-sm table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Customer</th><th>Branch</th><th>Rep</th><th>Model</th>
                  <th>Last activity</th><th className="">Deal value</th>
                  <th className="">Days stale</th>
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
                    <td className="">{formatInr(l.deal_value)}</td>
                    <td className="">
                      <span className={`badge text-bg-${staleBadgeVariant(l.days_stale)}`}>{l.days_stale}d</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
        </>
    )
}

export default LeadTable