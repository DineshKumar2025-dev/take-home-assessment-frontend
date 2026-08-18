import { useEffect, useRef, useState } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend, ComposedChart,
} from "recharts";
import { API_URL } from "../config.js";
import TimeRangeSelector from "./TimeRangeSelector";
import ExportButtons from "./ExportButtons";
import LeadTabel from "./LeadTabel.jsx";
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

function StatCard({ label, value, sub, variant, loading }) {
  return (
    <div className="col-6 col-md-4 col-xl-3">
      <div className="border rounded p-3 bg-white h-100">
        <div className="text-muted small text-uppercase">{label}</div>
        <div
          className={`fs-4 fw-semibold ${variant ? `text-${variant}` : ""}`}
          style={{ opacity: loading ? 0.5 : 1, transition: "opacity 0.2s" }}
        >
          {value}
        </div>
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

const EMPTY_STATE = {
  totals: {
    total_revenue: 0,
    target_revenue: 0,
    revenue_attainment_pct: null,
    units_delivered: 0,
    target_units: 0,
    units_attainment_pct: null,
    active_pipeline: 0,
    conversion_rate_pct: null,
    avg_deal_value: 0,
    stale_lead_count: 0,
  },
  dec_target_gap: {
    target_units: 0,
    actual_units: 0,
    unit_gap: 0,
    target_revenue: 0,
    actual_revenue: 0,
    revenue_gap: 0,
    attainment_pct: null,
  },
  stale_leads: [],
  monthly_trend: [],
  lead_sources: [],
  lost_reasons: [],
  branch_attainment: [],
};

function OverView() {
  const [data, setData] = useState(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRange, setSelectedRange] = useState("all");
  const pdfRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const query = selectedRange === "all" ? "" : `?range=${selectedRange}`;

    fetch(`${API_URL}api/dashboard/overview${query}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        return res.json();
      })
      .then((d) => setData(d))
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [selectedRange]);

  const { totals, dec_target_gap, stale_leads, monthly_trend, lead_sources, lost_reasons, branch_attainment } = data;

  const csvRows = [{
    "Total Revenue": totals.total_revenue,
    "Target Revenue": totals.target_revenue,
    "Revenue Attainment %": totals.revenue_attainment_pct,
    "Units Delivered": totals.units_delivered,
    "Target Units": totals.target_units,
    "Active Pipeline": totals.active_pipeline,
    "Conversion Rate %": totals.conversion_rate_pct,
    "Avg Deal Value": totals.avg_deal_value,
    "Stale Lead Count": totals.stale_lead_count,
    "Dec Target Gap (Revenue)": dec_target_gap.revenue_gap,
    "Dec Target Gap (Units)": dec_target_gap.unit_gap,
  }];

  return (
    <div>
      {error && (
        <div className="alert alert-danger d-flex justify-content-between align-items-center mb-3" role="alert">
          <span>Couldn't load latest dashboard data: {error}</span>
          <button className="btn-close" onClick={() => setError(null)} aria-label="Close"></button>
        </div>
      )}

      <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
        <div>
          <h1 className="h4 mb-1">Dashboard</h1>
          <p className="text-muted small mb-0">Company-wide performance</p>
        </div>
        <ExportButtons
          csvData={csvRows}
          csvFilename={`overview-${selectedRange}.csv`}
          pdfRef={pdfRef}
          pdfFilename={`overview-${selectedRange}.pdf`}
          pdfTitle="Dashboard Overview"
        />
      </div>

      <TimeRangeSelector value={selectedRange} onChange={setSelectedRange} />

      <div ref={pdfRef}>
        {/* Vital signs */}
        <div className="row g-3 mb-4">
          <StatCard
            label="Total Revenue"
            value={formatInr(totals.total_revenue)}
            sub={`vs target ${formatInr(totals.target_revenue)}`}
            loading={loading}
          />
          <StatCard
            label="Target Attainment"
            value={formatPct(totals.revenue_attainment_pct)}
            variant={attainmentVariant(totals.revenue_attainment_pct)}
            loading={loading}
          />
          <StatCard
            label="Units Delivered"
            value={totals.units_delivered}
            sub={`target ${totals.target_units}`}
            loading={loading}
          />
          <StatCard label="Active Pipeline" value={totals.active_pipeline} sub="leads in progress" loading={loading} />
          <StatCard label="Conversion Rate" value={formatPct(totals.conversion_rate_pct)} loading={loading} />
          <StatCard label="Avg Deal Value" value={formatInr(totals.avg_deal_value)} loading={loading} />
          <StatCard
            label="Stale Leads"
            value={totals.stale_lead_count}
            sub="no activity 7+ days"
            variant={totals.stale_lead_count > 0 ? "danger" : "success"}
            loading={loading}
          />
          <StatCard
            label="Dec Target Gap"
            value={formatInr(dec_target_gap.revenue_gap)}
            sub={`${dec_target_gap.unit_gap} units short`}
            variant={dec_target_gap.revenue_gap > 0 ? "danger" : "success"}
            loading={loading}
          />
        </div>

        {/* Insight strip */}
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
              {monthly_trend.length === 0 ? (
                <div className="text-muted text-center py-5">{loading ? "Loading…" : "No data yet."}</div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Branch attainment */}
          <div className="col-lg-4">
            <div className="border rounded p-4 bg-white h-100">
              <h3 className="h6 mb-3">Branch attainment</h3>
              {branch_attainment.length === 0 ? (
                <div className="text-muted text-center py-5">{loading ? "Loading…" : "No branch data yet."}</div>
              ) : (
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
              )}
            </div>
          </div>

          {/* Lead sources */}
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

          {/* Lost reasons */}
          <div className="col-lg-6">
            <div className="border rounded p-4 bg-white h-100">
              <h3 className="h6 mb-3">Why deals are lost</h3>
              {lost_reasons.length === 0 ? (
                <div className="text-muted text-center py-5">{loading ? "Loading…" : "No lost leads recorded."}</div>
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
        <div className="border rounded p-4 bg-white mb-4">
          <h3 className="h6 mb-3">Stale leads (needs follow-up)</h3>
          {stale_leads.length === 0 ? (
            <div className="text-muted text-center py-4">{loading ? "Loading…" : "No stale leads. 🎉"}</div>
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

export default OverView;