import { useEffect, useState,useRef } from "react";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import { API_URL } from "../config.js";
import TimeRangeSelector from "./Shared/TimeRangeSelector";
import ExportButtons from "./Shared/ExportButtons";
import LeadTabel from "./Shared/LeadTabel.jsx";
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
  const [selectedRange, setSelectedRange] = useState("all");
  const pdfRef = useRef(null);
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
        console.log(d);
        setData(d)
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedRange]);

  const { total_active_leads, stale_count, buckets, branch_breakdown, leads } = data;
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
  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load latest lead aging data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      

      
      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
        <div>
          <h1 className="h4 mb-1">Lead Aging</h1>
          <p className="text-muted small mb-0">
            {loading ? "Loading…" : `${total_active_leads} active leads · ${stale_count} going cold (7+ days no activity)`}
          </p>
        </div>
        <ExportButtons
          csvData={csvRows}
          csvFilename="lead-aging.csv"
          pdfRef={pdfRef}
          pdfFilename="lead-aging.pdf"
          pdfTitle="Lead Aging Report"
        />
      </div>
      <TimeRangeSelector value={selectedRange} onChange={setSelectedRange} />
      <div ref={pdfRef}>
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
              
              <LeadTabel selectedRange={selectedRange}/>
            </div>
          )}
        </div>
    </div>
    </div>
  );
}

export default LeadAging;